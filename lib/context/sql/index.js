import env from '../../../config/env.js';
import knex from 'knex';
import configuration from '../../../sql/knexfile.js';
import u from '../../utils/index.js';

const connection = knex(configuration[process.env.DDBB_ENV || 'development']);

let tables = {};

const EXPLICIT_CONV_CC_2_PC = { "url": "URL", "dni": "DNI" }
const EXPLICIT_CONV_PC_2_CC = Object.entries(EXPLICIT_CONV_CC_2_PC).reduce((p, x) => ({ ...p, [x[1]]: x[0] }), {}); //inverts key/values
const toPascalCase = (str) => u.toPascalCase(str, EXPLICIT_CONV_CC_2_PC);
const toCamelCase = (str) => u.toCamelCase(str, EXPLICIT_CONV_PC_2_CC);
const keysToPC = (obj) => u.keysToPC(obj, EXPLICIT_CONV_CC_2_PC);
const keysToCC = (obj) => u.keysToCC(obj, EXPLICIT_CONV_PC_2_CC);

/**
* @param {string} tableName -> name of SQL table
* @param {function} where -> filter
* @returns {Promise} a Promise with the selected values
*/
const get = async (tableName, where) => {
    tables[tableName] = tables[tableName] != null ? tables[tableName] : (await connection.select('*').from(tableName)).map(keysToCC);
    return where == null ? tables[tableName] : tables[tableName].filter(where);
};
/**
* @param {string} tableName -> name of SQL table
* @param {object} value -> row/s to insert
* @param {Array} returning -> names of the columns of the inserted rows I want to get back
* @returns {Promise} a Promise with the selected values
*/
const add = async (tableName, values, returning) => {
    values = Array.isArray(values) ? values : [values];
    values = values.map(keysToPC);
    returning ? returning = returning.map(toPascalCase) : null;
    let res = await connection.insert(values).returning(returning).into(tableName).catch(log.error);
    res = returning ? res.map(keysToCC) : res;
    tables[tableName] = (await connection.select('*').from(tableName)).map(keysToCC);
    return res;
};
/**
* @param {string} tableName -> name of SQL table
* @param {function} where -> filter
* @returns {Promise} a Promise with the selected values
*/
const del = async (tableName, where) => {
    const res = [];
    !tables[tableName] ? tables[tableName] = (await connection.select('*').from(tableName)).map(keysToCC) : null;
    let toDel = tables[tableName].filter(where);
    toDel.forEach(obj => Object.keys(obj).forEach(k => obj[k] === null ? delete obj[k] : null));
    toDel = toDel.map(keysToPC);
    for (let i = 0; i < toDel.length; i++) {
        res.push(await connection(tableName).whereIn(Object.keys(toDel[i]), [Object.values(toDel[i])]).del());
    }
    tables[tableName] = (await connection.select('*').from(tableName)).map(keysToCC);
    return res;
};
/**
* @param {string} tableName -> name of SQL table
* @param {function} where -> filter
* @param {object} value -> values to edit
* @returns {Promise} a Promise with the selected values
*/
const edit = async (tableName, where, value) => {
    const res = [];
    !tables[tableName] ? tables[tableName] = await connection.select('*').from(tableName).map(keysToCC) : null;
    let toUpdt = tables[tableName].filter(where);
    toUpdt.forEach(obj => Object.keys(obj).forEach(k => obj[k] === null ? delete obj[k] : null));
    toUpdt = toUpdt.map(keysToPC);
    value = keysToPC(value)
    for (let i = 0; i < toUpdt.length; i++) {
        res.push(await connection(tableName).whereIn(Object.keys(toUpdt[i]), [Object.values(toUpdt[i])]).update(value));
    }
    tables[tableName] = (await connection.select('*').from(tableName)).map(keysToCC);
    return res;
};

const raw = connection.raw;

const transaction = async () => { throw 'Not implemented yet!' }


export default { get, add, del, edit, raw, transaction }