import env from '../config/env.js';
import knex from '../db.js';

const { prefix: cdcPrefix, id: cdcId, action: cdcAction, createdAt: cdcCreatedAt } = env.tables.cdc;

async function getSchema() {
    const res = {};

    const tables = await knex.raw(`
    SELECT tablename 
    FROM pg_catalog.pg_tables 
    WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema';
`);

    for (const table of tables.rows) {
        const columnsInfo = await knex.raw(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = '${table.tablename}';
    `);
        if (!table.tablename.toLowerCase().includes('knex')) {
            res[table.tablename] = columnsInfo.rows;
        }

    }

    return res;
};

async function createCDC() {
    let schema = await getSchema();

    async function createTableFromSchema(auditTableName, schemaArray) {
        await knex.schema.createTable(auditTableName, (table) => {
            // Asignamos un ID automático como clave primaria
            table.increments(cdcId).primary();
            table.string(cdcAction).notNullable();
            table.bigInteger(cdcCreatedAt).defaultTo(knex.raw('EXTRACT(EPOCH FROM NOW()) * 1000'));
            // Iteramos a través del array del esquema para crear las columnas
            for (const column of schemaArray) {
                const { column_name, data_type, is_nullable } = column;
                let knexColumn;

                switch (data_type) {
                    case 'integer':
                        knexColumn = table.integer(column_name);
                        break;
                    case 'character varying':
                        knexColumn = table.string(column_name);
                        break;
                    case 'bigint':
                        knexColumn = table.bigInteger(column_name);
                        break;
                    case 'real':
                        knexColumn = table.float(column_name);
                        break;
                    case 'boolean':
                        knexColumn = table.boolean(column_name);
                        break;
                    case 'jsonb':
                        knexColumn = table.jsonb(column_name);
                        break;
                    case 'timestamp':
                        knexColumn = table.timestamp(column_name);
                        break;
                    default:
                        throw new Error(`Tipo de dato no soportado: ${data_type}`);
                }

                // if (is_nullable === 'NO') {
                //     knexColumn.notNullable();
                // }
            }
        });
    }

    const tableNames = Object.keys(schema);
    const noCDCTables = tableNames.filter(x => !x.startsWith(cdcPrefix) && !x.includes('knex') && !tableNames.find(y => y === `${cdcPrefix}${x}`))

    for (const tableName of noCDCTables) {
        const auditTableName = `${cdcPrefix}${tableName}`;
        const tableSchema = schema[tableName];
        await createTableFromSchema(auditTableName, tableSchema);
        schema = await getSchema();
        const triggerFunctionName = `${cdcPrefix}${tableName}_func`;
        const triggerName = `${cdcPrefix}${tableName}_trigger`;
        const insertInto = `${cdcAction}, ${cdcCreatedAt}${tableSchema.reduce((p, x) => p + `, "${x.column_name}"`, '')}`;
        const values = `TG_OP, EXTRACT(EPOCH FROM NOW()) * 1000${tableSchema.reduce((p, x) => p + `, NEW."${x.column_name}"`, '')}`;
        const createTriggerFunctionSQL = `
        CREATE OR REPLACE FUNCTION ${triggerFunctionName}() RETURNS TRIGGER AS $$
        BEGIN
        IF TG_OP = 'DELETE' THEN
            INSERT INTO "${auditTableName}"(${insertInto}) VALUES (${values.replace(/NEW\./g, 'OLD.')});
            RETURN OLD;
        ELSIF TG_OP = 'UPDATE' THEN
            INSERT INTO "${auditTableName}"(${insertInto}) VALUES (${values});
            RETURN NEW;
        ELSIF TG_OP = 'INSERT' THEN
            INSERT INTO "${auditTableName}"(${insertInto}) VALUES (${values});
            RETURN NEW;
        END IF;
        RETURN NULL;
        END;
        $$ LANGUAGE plpgsql;
    `;
        const createTriggerSQL = `
      CREATE OR REPLACE TRIGGER ${triggerName}
      AFTER INSERT OR UPDATE OR DELETE ON "${tableName}"
      FOR EACH ROW EXECUTE FUNCTION ${triggerFunctionName}();
    `;

        await knex.raw(createTriggerFunctionSQL);
        await knex.raw(createTriggerSQL);
        const rows = (await knex.raw(`SELECT * FROM "${tableName}"`)).rows;
        const cdcTableName = `${cdcPrefix}${tableName}`;
        const cdcTableSchema = schema[cdcTableName];

        for (const row of rows) {
            const cdcRow = { ...row, [cdcAction]: 'INITIAL', [cdcCreatedAt]: Date.now() }
            const keys = Object.keys(cdcRow).filter(key => cdcTableSchema.find(c => c.column_name === key));
            const values = keys.map(key => cdcRow[key]);
            const query = `INSERT INTO "${cdcTableName}" ("${keys.join('", "')}") VALUES (${keys.map((_, i) => '$' + (i + 1)).join(', ')}) RETURNING *`;
            await knex(cdcTableName).insert(cdcRow)// .raw(query, values);
        }
    }
};

async function createNotifications() {
    const schema = await getSchema();
    await knex.raw(`CREATE OR REPLACE FUNCTION notify_trigger() RETURNS TRIGGER AS $$
    DECLARE
        data json;
        notification json;
    BEGIN
        -- TG_OP es una variable global que contiene la operación: INSERT, UPDATE, DELETE
        IF (TG_OP = 'DELETE') THEN
            data := row_to_json(OLD);
            notification := json_build_object(
                'table', TG_TABLE_NAME,
                'action', TG_OP,
                'data', data
            );
            PERFORM pg_notify('notifications_channel', notification::text);
            RETURN OLD;  -- Cambiado a OLD para DELETE
        ELSE
            data := row_to_json(NEW);
            -- Construir el objeto JSON para la notificación
            notification := json_build_object(
                'table', TG_TABLE_NAME,
                'action', TG_OP,
                'data', data
            );
            -- Emitir la notificación
            PERFORM pg_notify('notifications_channel', notification::text);
            RETURN NEW;
        END IF;
    END;
    $$ LANGUAGE plpgsql;
`)

    const tablesNames = Object.keys(schema).filter(x => !x.toLowerCase().includes('knex'));
    for (let i = 0; i < tablesNames.length; i++) {
        await knex.raw(`CREATE OR REPLACE TRIGGER change_trigger
    AFTER INSERT OR UPDATE OR DELETE ON "${tablesNames[i]}"
    FOR EACH ROW EXECUTE FUNCTION notify_trigger();`);
    }
};

await createCDC();
await createNotifications();

console.log('Migration finished OK!')