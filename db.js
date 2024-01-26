import knex from 'knex';
import knexConfig from './knexfile.js';

const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment];


// Exportar la instancia para su reutilización.
export default knex(config)
