const sql = require('mssql');


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

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

pool.on('error', err => {
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
testConnection()

module.exports = pool