const pool = require('../database');
const poolConnect = pool.connect();
const QRCode = require('qrcode')



const request = pool.request(); // or: new sql.Request(pool1)

pool.on('error', err => {
    // ... error handler
    console.log(err)
});

async function obtenerCuentas(req, res, next) {
    const tipo = req.params.tipo
    try {
        await poolConnect;
        if (tipo !== undefined) {
            const result = await request.query(`SELECT * FROM usuarios where tipo = '${tipo}'`)
            res.json(result.recordset)
        } else {
            const result2 = await request.query(`SELECT * FROM usuarios`)
            res.json(result2.recordset)
        }
    } catch (err) {
        console.error('SQL error', err);
    }
}

async function datosCuenta(req, res, next) {
    await QRCode.toDataURL(JSON.stringify(req.user), function (err, url) {
        let cuenta = {
            user: req.user,
            menu: 'buscarAsegurado',
            qr: `${url}`,
            file: `../photos/${req.user.email}.jpg`
        }
        return cuenta;
    })

}



module.exports = {
    obtenerCuentas,
    datosCuenta
}