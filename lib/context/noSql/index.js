import env from '../../../config/env.js';
import mongo from 'mongodb';

//-------------------------- AUX. FUNCTIONS -------------------------

//Converts input into an object
const toObject = (input) => {
    var result = null;
    if (input == null) result = {};
    else if (typeof input === 'string') result = JSON.parse(input);
    else if (typeof input === 'object') result = input;
    else throw `Cannot convert type: ${typeof input} to object!`;
    return result;
};
/**
* @param {string} db -> Database name
* @param {string} col -> Collection name
* @returns {Promise} a Promise that returns collection
*/
const getCol = async (db, col) => {
    try {
        if (_client == null) {
            _client = new mongo.MongoClient(URI, connOpts);
            _client.on('error', (err) => console.log('Redis Client Error', err));
            await _client.connect();
        }
        let _db = await _client.db(db);
        let _col = await _db.collection(col);
        return _col;
    } catch (error) {
        _client = null;
        throw error;
    }
};

/**
* @param {string} db -> Database name
* @param {string} col -> Collection name
* @param {function} where -> Query to filter result (OPTIONAL)
* @param {function} options -> (OPTIONAL)
* @returns {Promise} a Promise with the selected values
*/
const get = async (db, col, where, options) => {
    //Validations
    if (typeof (db) !== 'string') throw 'db should be a string!';
    if (typeof (col) !== 'string') throw 'col should be a string!';
    if (where != null && typeof (where) !== 'function') throw 'query should be a function!';

    let collection = await getCol(db, col);
    let res = await collection.find({}, toObject(options)).toArray();
    res.forEach(x => x._id = x._id.toString());
    return where ? res.filter(where) : res;
};
/**
* @param {string} db -> Database name
* @param {string} col -> Collection name
* @param {object} documents -> Object to add
* @param {function} options -> (OPTIONAL)
* @returns {Promise} a Promise with op result
*/
const add = async (db, col, documents, options) => {
    try {
        documents = Array.isArray(documents) ? documents : [documents];
        documents = documents.map(x => toObject(x));
    } catch (error) {
        log.error(documents);
        throw 'values should be an object or objects array!';
    }

    //Validations
    if (typeof (db) !== 'string') throw 'db should be a string!';
    if (typeof (col) !== 'string') throw 'col should be a string!';

    let collection = await getCol(db, col);
    let res = await collection.insertMany(documents, toObject(options));
    return res;
};
/**
* @param {string} db -> Database name
* @param {string} col -> Collection name
* @param {function} where -> Condition to erase document
* @param {function} options -> (OPTIONAL)
* @returns {Promise} a Promise with op result
*/
const del = async (db, col, where, options) => new Promise (async (res,rej) =>{
    if (typeof (db) !== 'string') throw 'db should be a string!';
    if (typeof (col) !== 'string') throw 'col should be a string!';
    if (where != null && typeof (where) !== 'function') throw 'query should be a function!';

    let collection = await getCol(db, col);
    let toDelete = await collection.find({}, toObject(options)).toArray();
    toDelete.forEach(x => x._id = x._id.toString());
    toDelete = where ? toDelete.filter(where) : toDelete;
    toDelete = toDelete.map(x => new ObjectId(x._id) );
    collection.deleteMany( { _id: { $in: toDelete } }, (err, obj) => err ? rej(err) : res(obj));
});
/**
* @param {string} tableName -> name of SQL table
* @param {function} where -> filter
* @param {object} value -> values to edit
* @returns {Promise} a Promise with the selected values
*/
const edit = async (tableName, where, value) => {
    throw 'Not implemented yet!';
    // const client = await getClient();
    // let table = await get(tableName);
    // const toUpdt = table.filter(where);
    // toUpdt.forEach(obj => Object.keys(obj).forEach(k => obj[k] === null ? delete obj[k] : null));
    // for (let i = 0; i < toUpdt.length; i++) {
    //     const obj = toUpdt[i];
    //     await connection(tableName).whereIn(Object.keys(obj), [Object.values(obj)]).update(value).catch(log.error);
    // }
    // table = await connection.select('*').from(tableName).catch(log.error);
    // await client.set(tableName, JSON.stringify(table));
    // return toUpdt;
};

const transaction = () => { throw 'Not implemented yet!' }
/**
* @param {string} db -> Database name
* @returns {Promise} a Promise that returns list of collections inside the database
*/
const listCollections = async (db) => {
    try {
        if (_client == null) {
            _client = new mongo.MongoClient(URI, connOpts);
            _client.on('error', (err) => console.log('Redis Client Error', err));
            await _client.connect();
        }
        let _db = await _client.db(db);
        let list = await _db.listCollections().toArray();
        return list;
    } catch (error) {
        _client = null;
        throw error;
    }
};
/**
* @param {string} db -> Database name
* @param {string} col -> Collection name
* @param {string} where -> Query to filter result (OPTIONAL)
* @returns {Promise} a Promise that returns collection elements count that satisfy the query
*/
const count = async (db, col, where) => {
    //Validations
    if (typeof (db) !== 'string') throw 'db should be a string!';
    if (typeof (col) !== 'string') throw 'col should be a string!';
    if (where != null && typeof (where) !== 'function') throw 'query should be a function!';

    let collection = await getCol(db, col);
    let res = await collection.find({}, toObject(options)).toArray();
    return where ? res.filter(where).length : res.length;
};

export default { get, add, del, edit, count, transaction, listCollections, count }