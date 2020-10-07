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
    const tipo = req.params.tipo
    try {
        await poolConnect;
        if (tipo == '1') { //asegurados
            const result = await request.query(`SELECT id_carnet,cod,name,login, carnet.created_at,motivo,comprobante FROM carnet,usuarios,asegurados2 where cod = '${codigo}'
            and cod = cod_asegurado and id_usuario = usuarios.id`)
            res.json(result.recordset)
        }
        if (tipo == '2') { //beneficiarios
            const result2 = await request.query(`SELECT id_carnet,cod,name,login, carnet.created_at,motivo,comprobante FROM carnet,usuarios,beneficiarios2 where cod_be = '${codigo}'
            and cod = cod_asegurado and id_usuario = usuarios.id`)
            res.json(result2.recordset)
        }
    } catch (err) {
        console.error('SQL error', err);
        res.json({
            message: 'Error en los datos'
        })
    }
}

async function comprobarPago(req, res) {
    try {
        await poolConnect;
        console.log(req.body)
        // const result = await request.query(`SELECT id_carnet,cod,name,login, carnet.created_at,motivo,comprobante FROM carnet,usuarios,asegurados2 where cod = '${codigo}'
        //     and cod = cod_asegurado and id_usuario = usuarios.id and id_carnet = `)
        // if (req.body.comprobarPago == result.recordset[0]) {

        // }
        res.redirect('/buscarAsegurado')
    } catch (err) {
        console.error('SQL error', err);
        res.json({
            message: 'Error en el comprobante'
        })
    }
}


module.exports = {
    obtenerCarnet,
    comprobarPago
}