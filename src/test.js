const pool = require('./database');
const poolConnect = pool.connect();


const request = pool.request(); // or: new sql.Request(pool1)

pool.on('error', err => {
    // ... error handler
    console.log(err)
});


// async () => {
//     await poolConnect; // ensures that the pool has been created
//     try {
//         // const result = await request.query(`SELECT id,login,pass FROM usuarios WHERE id=1`)
//         // console.log(result.recordset)
//         return request;
//     } catch (err) {
//         console.error('SQL error', err);
//     }
// };

async function test2(req, res, next) {
    try {
        await poolConnect;
        const result = await request.query(`SELECT * FROM usuarios`)
        console.log(result.recordset)
        res.json(result.recordset)
        // return result;
    } catch (err) {
        console.error('SQL error', err);
    }
}

module.exports = {
    test2
}