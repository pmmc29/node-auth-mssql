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
            const result = await request.query(`SELECT id_carnet,agenda,name,login, carnet.created_at,motivo,comprobante,'Asegurado' as tipo FROM carnet,usuarios,asegurados2 where cod = '${codigo}'
            and agenda = age_asegurado and id_usuario = usuarios.id`)
            res.json(result.recordset)
        }
        if (tipo == '2') { //beneficiarios
            const result2 = await request.query(`SELECT id_carnet,cod,name,login, carnet.created_at,motivo,comprobante,'Beneficiario' as tipo FROM carnet,usuarios,beneficiarios2 where cod_be = '${codigo}'
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
        if (req.body.btnImprimir =='') {
            console.log(req.body)
            req.flash('loginMessage', 'Printed')
            req.flash('aux', req.body.codigo)
            res.redirect('/buscarAsegurado')
        }
        if (req.body.btnComprobar == '') {
            console.log(req.body)
            const result = await request.query(`SELECT id_carnet,agenda,nombre,login, carnet.created_at,motivo,comprobante FROM carnet,usuarios,asegurados where 
            agenda = age_asegurado and id_usuario = usuarios.id and comprobante = ${req.body.comprobante}`)
            console.log(result.recordset.length)
            if (result.recordset.length > 0 ) {
                req.flash('loginMessage', 'Comprobante Verificado')
            }else{
                req.flash('loginMessage', 'No existe ese Nro. de Comprobante')
            }
            
            req.flash('aux', req.body.codigo)
            res.redirect('/buscarAsegurado')
        }


        // console.log(req.body)
        // req.flash('aux', req.body.edtBuscar)
        // res.redirect('/buscarAsegurado')
    } catch (err) {
        console.error('SQL error', err);
        req.flash('aux', req.body.codigo)
        req.flash('loginMessage', 'Error en el Nro. de Comprobante')
        res.redirect('/buscarAsegurado')
    }
}


module.exports = {
    obtenerCarnet,
    comprobarPago
}