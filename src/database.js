const sql = require('mssql');

const config = {
    user: 'carnet_user',
    password: 'carnet2021',
    server: 'localhost',
    database: 'test',
    options: {
        enableArithAbort: true,
        encrypt: true,
        cryptoCredentialsDetails: {
            minVersion: 'TLSv1'
        }
    }
}
const configSinec = {
    user: 'carnet_user',
    password: 'carnet2021',
    server: 'localhost',
    database: 'sinec2021',
    options: {
        enableArithAbort: true,
        encrypt: true,
        cryptoCredentialsDetails: {
            minVersion: 'TLSv1'
        }
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

module.exports = pool,config