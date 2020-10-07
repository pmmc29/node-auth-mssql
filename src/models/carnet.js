const pool = require('../database');
const poolConnect = pool.connect();
const QRCode = require('qrcode')



const request = pool.request(); // or: new sql.Request(pool1)

pool.on('error', err => {
    // ... error handler
    console.log(err)
});

async function obtenerCarnet(req, res) {
    const codigo = req.params.codigo
    try {
        await poolConnect;
        const result = await request.query(`SELECT id_carnet,cod,name,login, carnet.created_at,motivo,comprobante FROM carnet,usuarios,asegurados2 where cod = '${codigo}'
        and cod = cod_asegurado and id_usuario = usuarios.id`)
        res.json(result.recordset)
    } catch (err) {
        console.error('SQL error', err);
    }
}


module.exports = {
    obtenerCarnet
}