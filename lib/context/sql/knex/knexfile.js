
import env from '../../../../config/env.js'
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
 export default {
    client: 'postgresql',
    connection: {
      database: env.sql.database,
      user: env.sql.user, 
      password:  env.sql.password, 
    },
    pool: { min: env.sql.poolMin, max: env.sql.poolMax },
    migrations: { tableName: 'knex_migrations'  },
    seeds: {  directory: './data/seeds' }
};

  // This is (prod)
  // development: {
  //   client: "pg",
  //   connection:
  //     "postgres://nmhiqgyq:9lKZEwxkUS9NANiMA28_8mGmLeL4Bk1o@kesavan.db.elephantsql.com/nmhiqgyq",
  //   pool: {
  //     min: 2,
  //     max: 10,
  //   },
  // },

