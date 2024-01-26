export const up = function (knex) {
    return knex.schema
        .then(() => {
            return knex.schema.createTable('personas', table => {
                table.increments('id').primary();
                table.string('email').notNullable().unique();
                table.string('password');
                table.string('nombre');
                table.string('apellido');
                table.string('DNI');
                table.integer('editorId').references('id').inTable('personas').notNullable().onDelete('CASCADE');
                table.biginteger('fechaEdicion').notNullable();
            })
        })
        .then(() => {
            return knex.schema.createTable('empresas', table => {
                table.increments('id').primary();
                table.integer('nombre').notNullable();
                table.integer('sector').notNullable();
                table.integer('editorId').references('id').inTable('personas').notNullable().onDelete('CASCADE');
                table.biginteger('fechaEdicion').notNullable();
            })
        })
        .then(() => {
            return knex.schema.createTable('productos', table => {
                table.increments('id').primary();
                table.string('nombre').notNullable().unique();
                table.string('descripcion');
                table.integer('editorId').references('id').inTable('personas').notNullable().onDelete('CASCADE');
                table.biginteger('fechaEdicion').notNullable();
            })
        })
        .then(() => {
            return knex.schema.createTable('compras', table => {
                table.increments('id').primary();
                table.integer('compradorId').references('id').inTable('personas').notNullable().onDelete('CASCADE');
                table.integer('editorId').references('id').inTable('personas').notNullable().onDelete('CASCADE');
                table.biginteger('fechaEdicion').notNullable();
            })
        })
        .then(() => {
            return knex.schema.createTable('productosComprasMap', table => {
                table.integer('compraId').references('id').inTable('compras').notNullable().onDelete('CASCADE');
                table.integer('productoId').references('id').inTable('productos').notNullable().onDelete('CASCADE');
                table.integer('editorId').references('id').inTable('personas').notNullable().onDelete('CASCADE');
                table.biginteger('fechaEdicion').notNullable();
                table.primary(['compraId', 'productoId']);
            })
        })
};

export const down = function (knex) {
    knex.destroy();
    return knex.schema
        .then(() => knex.schema.dropTableIfExists("personas"))
        .then(() => knex.schema.dropTableIfExists("empresas"))
        .then(() => knex.schema.dropTableIfExists("productos"))
        .then(() => knex.schema.dropTableIfExists("compras"))
        .then(() => knex.schema.dropTableIfExists("productosComprasMap"))
};

export const config = { transaction: true };
