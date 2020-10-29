const sql = require('mssql');

///////////////////////////////////////////////////////
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
const pool = new sql.ConnectionPool(configSinec);
const poolConnect = pool.connect();
const request = pool.request();

pool.on('error', err => {
    // ... error handler
    console.log(err)
})
///////////////////////////////////////////////////////
const pooldb = require('../database');
const poolConnectdb = pooldb.connect()
const requestdb = pooldb.request();
///////////////////////////////////////////////////////


async function verificarComprobante(req,res) {
    if (req.isAuthenticated()) {
        console.log(req.body)
        await poolConnect;
        const result = await request.query(`select * from DocumentoFinanciero where TipoDocumentoFinanciero = 207 and numero = '${req.body.comprobante}'`)
        if (req.body.btnConsultar == '') { //click en verificar
            if (result.recordset[0]) { //1 fila afectada, si existe el num de comprobante
                console.log(result.recordset[0].FechaHora.toString())
                req.flash('loginMessage', `Comprobante ${result.recordset[0].Numero} con fecha: `, result.recordset[0].FechaHora)
                req.flash('aux', req.body.codigo)
                res.redirect('/buscarAsegurado')
            }else{
                req.flash('loginMessage', 'Numero de comprobante no existe')
                req.flash('aux', req.body.codigo)
                res.redirect('/buscarAsegurado')
            }
        }
        if (req.body.btnRegistrar == '' && req.body.tipo == 1 && result.recordset[0]) { //click en registrar ASEGURADO
            await poolConnectdb;
            const result2 = await requestdb.query(`insert into carnet (cod_asegurado,id_usuario,created_at,motivo,comprobante,estado,fec_comp) 
                                                values('${req.body.codigo}',${req.user.id}, SYSDATETIME(), '${req.body.motivo}', '${result.recordset[0].Numero}', 1, '${result.recordset[0].FechaHora}')`)
            console.log(result2.recordset)
            // if (result) { //1 fila afectada, si existe el num de comprobante
            //     req.flash('loginMessage', `Comprobante ${result.recordset[0].Numero} con fecha: `, result.recordset[0].Fecha)
            //     req.flash('aux', req.body.codigo)
            //     res.redirect('/buscarAsegurado')
            // } else {
            //     req.flash('loginMessage', 'Numero de comprobante no existe')
            //     req.flash('aux', req.body.codigo)
            //     res.redirect('/buscarAsegurado')
            // }
        }
    } else {
        res.render('login', {
            title: "Iniciar Sesion"
        });
    }
}

module.exports = {verificarComprobante}