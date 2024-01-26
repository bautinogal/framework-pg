import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import utils from '../lib/utils/index.js';
utils.randomElements
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') })

//U: Use this to insert more than 50 rows at a time
const insertMany = async (table, arr) => {
    let res = [];
    const chunkSize = 50;
    for (let i = 0; i < arr.length; i += chunkSize) {
        const chunk = arr.slice(i, i + chunkSize);
        await table.insert(chunk)
        //res = [...res, ...await table.insert(chunk).returning(['*'])];
    }
    return res;
};
const getData = async () => {
    const getCSV = async (csvPath) => new Promise((resolve, reject) => {
        const csvFilePath = path.join(__dirname, csvPath);
        const results = [];

        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', reject);
    });

    const empresas = await getCSV('./data/empresas.csv');
    const personas = await getCSV('./data/personas.csv');
    const localidades = JSON.parse(fs.readFileSync(path.join(__dirname, './data/localidades.json')));

    return { empresas, personas, localidades };
};


export const seed = async function (knex) {
    const createPersonas = async (personas) => {
        const table = knex('personas');
        await insertMany(table, personas.map(x => ({
            email: (x.nombre + x.apellido + '_' + utils.randomString(5) + '@gmail.com').replace(/ /g, '').toLowerCase(),
            password: utils.randomString(10),
            nombre: x.nombre,
            apellido: x.apellido,
            DNI: utils.randomInt(10000000, 40000000),
            editorId: 1,
            fechaEdicion: Date.now()
        })));

        // const batchSize = 100;
        // for (let i = 0; i < 500000; i++) {
        //     let updates = [];
        //     for (let j = i; j < i + batchSize && j < 500000; j++) {
        //         updates.push(
        //             table
        //                 .where({ id: utils.randomInt(1, 100000) })
        //                 .update({ DNI: utils.randomInt(10000000, 40000000) })
        //         );
        //     }
        //     await Promise.all(updates);
        //     knex('a')
        // };

//         Raw PSGQL
//         DO $$
// DECLARE
//     i INT;
//     random_id INT;
//     random_password TEXT;
// BEGIN
//     FOR i IN 1..500000 LOOP
//         -- Genera un ID aleatorio entre 1 y 100000
//         SELECT INTO random_id floor(random() * 99999 + 1)::int FROM generate_series(1,1);
        
//         -- Genera una cadena aleatoria para la contraseña (ajusta la longitud según necesites)
//         SELECT INTO random_password substring(md5(random()::text) from 1 for 10);
        
//         -- Actualiza la fila con el ID aleatorio
//         UPDATE personas
//         SET password = random_password
//         WHERE id = random_id;
//     END LOOP;
// END $$;

    };

    const { empresas, personas, localidades } = await getData();
    await createPersonas(personas);

};