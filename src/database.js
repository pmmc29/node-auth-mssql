const sql = require('mssql');

//////////////////////////////////////////////////////////////
// var Client = require('ftp');
// const fs = require('fs')
// var c = new Client();
// c.on('ready', function () {
//     // c.list(function (err, list) {
//     //     if (err) throw err;
//     //     console.dir(list);
//     //     c.end();
//     // });
//     c.get('aseg10112020.txt', function (err, stream) {
//         if (err) throw err;
//         stream.once('close', function () {
//             c.end();
//         });
//         stream.pipe(fs.createWriteStream('./src/dbfiles/new-asegurados.txt'));
//     });
//     c.get('bnf10112020.txt', function (err, stream) {
//         if (err) throw err;
//         stream.once('close', function () {
//             c.end();
//         });
//         stream.pipe(fs.createWriteStream('./src/dbfiles/new-beneficiarios.txt'));
//     });
// });
// var options = {
//     host: '192.168.100.174',
//     user: 'pedrom',
//     password: 'pedro2020'
// }
// // connect to localhost:21 as anonymous
// c.connect(options);
//////////////////////////////////////////////////////////////

const config = {
    user: 'testuser',
    password: 'pedro123',
    server: 'localhost',
    database: 'test',
    options: {
        enableArithAbort: true,
        encrypt: true
    }
}
const configSinec = {
    user: 'testuser',
    password: 'pedro123',
    server: 'localhost',
    database: 'sinec2020',
    options: {
        enableArithAbort: true,
        encrypt: true
    }
}

const pool = new sql.ConnectionPool(config);
const pool2 = new sql.ConnectionPool(configSinec);
const poolConnect = pool.connect();
const poolConnect2 = pool2.connect();

pool.on('error', err => {
    // ... error handler
    console.log(err)
})
pool2.on('error', err => {
    // ... error handler
    console.log(err)
})

async function testConnection() {
    await poolConnect; // ensures that the pool has been created
    try {
        const request = pool.request(); // or: new sql.Request(pool1)
        const result = await request.query('SELECT DB_NAME() AS [Database]')
        console.log(result.recordset[0], ' is connected')
        return result;
    } catch (err) {
        console.error('SQL error', err);
    }
}
async function testConnection2() {
    await poolConnect2; // ensures that the pool has been created
    try {
        const request = pool2.request(); // or: new sql.Request(pool1)
        const result = await request.query('SELECT DB_NAME() AS [Database]')
        console.log(result.recordset[0], ' is connected')
        return result;
    } catch (err) {
        console.error('SQL error', err);
    }
}
testConnection()
testConnection2()

module.exports = pool