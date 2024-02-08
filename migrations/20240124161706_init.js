export const up = function (knex) {
    return knex.schema
        //#region basic tables
        .then(() => {
            return knex.schema.createTable('users', table => {
                table.increments('id').primary();
                table.string('email').notNullable().unique();
                table.string('password').notNullable();
                table.string('name');
                table.string('lastName');
                table.integer('editorId').references('id').inTable('users').notNullable().onDelete('CASCADE');
                table.biginteger('editionDate').notNullable();
            })
        })
        .then(() => {
            return knex.schema.createTable('permissions', table => {
                table.increments('id').primary();
                table.string('name').notNullable().unique();
                table.string('description');
                table.boolean('generic').defaultTo(false);
            })
        })
        .then(() => {
            return knex.schema.createTable('rols', table => {
                table.increments('id').primary();
                table.string('name').notNullable();
                table.string('description');
                table.integer('editorId').references('id').inTable('users').notNullable().onDelete('CASCADE');
                table.biginteger('editionDate').notNullable();
            })
        })
        .then(() => {
            return knex.schema.createTable('rolsPermissionsMap', table => {
                table.integer('permissionId').references('id').inTable('permissions').notNullable().onDelete('CASCADE');
                table.integer('rolId').references('id').inTable('rols').notNullable().onDelete('CASCADE');
                table.integer('editorId').references('id').inTable('users').notNullable().onDelete('CASCADE');
                table.biginteger('editionDate').notNullable();
                table.primary(['permissionId', 'rolId']);
            })
        })
        .then(() => {
            return knex.schema.createTable('rolsUsersMap', table => {
                table.integer('userId').references('id').inTable('users').notNullable().onDelete('CASCADE');
                table.integer('rolId').references('id').inTable('rols').notNullable().onDelete('CASCADE');
                table.integer('editorId').references('id').inTable('users').notNullable().onDelete('CASCADE');
                table.biginteger('editionDate').notNullable();
                table.primary(['userId', 'rolId']);
            })
        })
        //#endregion basic tables
        //#region custom tables
        .then(() => {
            return knex.schema.createTable('companies', table => {
                table.increments('id').primary();
                table.string('name').notNullable();
                table.string('sector').notNullable();
                table.integer('editorId').references('id').inTable('users').notNullable().onDelete('CASCADE');
                table.biginteger('editionDate').notNullable();
            })
        })
        .then(() => {
            return knex.schema.createTable('products', table => {
                table.increments('id').primary();
                table.string('name').notNullable().unique();
                table.string('description');
                table.integer('editorId').references('id').inTable('users').notNullable().onDelete('CASCADE');
                table.biginteger('editionDate').notNullable();
            })
        })
        .then(() => {
            return knex.schema.createTable('purchases', table => {
                table.increments('id').primary();
                table.integer('userId').references('id').inTable('users').notNullable().onDelete('CASCADE');
                table.integer('editorId').references('id').inTable('users').notNullable().onDelete('CASCADE');
                table.biginteger('editionDate').notNullable();
            })
        })
        .then(() => {
            return knex.schema.createTable('productsPurchasesMap', table => {
                table.integer('purchaseId').references('id').inTable('purchases').notNullable().onDelete('CASCADE');
                table.integer('productId').references('id').inTable('products').notNullable().onDelete('CASCADE');
                table.integer('editorId').references('id').inTable('users').notNullable().onDelete('CASCADE');
                table.biginteger('editionDate').notNullable();
                table.primary(['purchaseId', 'productId']);
            })
        })
        //#endregion custom tables
};

export const down = function (knex) {
    knex.destroy();
    return knex.schema
        .then(() => knex.schema.dropTableIfExists("productspurchasesMap"))
        .then(() => knex.schema.dropTableIfExists("purchases"))
        .then(() => knex.schema.dropTableIfExists("products"))
        .then(() => knex.schema.dropTableIfExists("companies"))
        .then(() => knex.schema.dropTableIfExists("users"))
        .then(() => knex.schema.dropTableIfExists("rolsUsersMap"))
        .then(() => knex.schema.dropTableIfExists("rolsPermissionsMap"))
        .then(() => knex.schema.dropTableIfExists("rols"))
        .then(() => knex.schema.dropTableIfExists("permissions"))
};

export const config = { transaction: true };
