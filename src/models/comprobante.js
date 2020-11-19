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


async function verificarComprobanteA(req, res) {
    if (req.isAuthenticated()) {
        try {
            console.log(req.body)
            await poolConnect;
            const result = await request.query(`select * from DocumentoFinanciero where TipoDocumentoFinanciero = 207 and numero = '${req.body.comprobante}'`)
            if (req.body.btnConsultar == '') { //click en consultar
                if (result.recordset[0]) { //1 fila afectada, si existe el num de comprobante
                    console.log(result.recordset[0].FechaHora.toString())
                    req.flash('loginMessage', `Comprobante: ${result.recordset[0].Numero} con fecha: `, result.recordset[0].FechaHora, ' Concepto: ', result.recordset[0].Concepto)
                    req.flash('aux', req.body.codigo)
                    res.redirect('/buscarAsegurado')
                } else {
                    req.flash('loginMessage', 'Numero de comprobante no existe')
                    req.flash('aux', req.body.codigo)
                    res.redirect('/buscarAsegurado')
                }
            }
            if (req.body.btnRegistrar == '') { //click en registrar comprobante
                if (result.recordset[0]) { //1 fila afectada, si existe el num de comprobante
                    await poolConnectdb;
                    const result2 = await requestdb.query(`insert into imp_carnet (id_carnet,front,back,fec_emision,estado,id_usuario,validez,comprobante,motivo,fec_contrato) 
                                            values((select id_carnet from carnet where cod_asegurado = '${req.body.codigo}'),'0','0', CONVERT(VARCHAR,GETDATE(), 103), '0',
                                            ${req.user.id}, '${req.body.validez}','${result.recordset[0].Numero}','${req.body.motivo}','${req.body.fec_contrato}')`)
                    if (result2.rowsAffected[0] === 1) { //1 fila afectada, se registro correctamente
                        req.flash('loginMessage',`Comprobante: ${req.body.comprobante}, Concepto: ${result.recordset[0].Concepto}`)
                        req.flash('aux', req.body.codigo)
                        res.redirect('/buscarAsegurado')
                    } else {
                        req.flash('loginMessage', 'Error en el registro del comprobante')
                        req.flash('aux', req.body.codigo)
                        res.redirect('/buscarAsegurado')
                    }
                } else {
                    req.flash('loginMessage', 'Numero de comprobante no existe')
                    req.flash('aux', req.body.codigo)
                    res.redirect('/buscarAsegurado')
                }
            }
        } catch (error) {
            console.log('SQL ERROR: ', error)
            req.flash('loginMessage', 'Error en el comprobante')
            req.flash('aux', req.body.codigo)
            res.redirect('/buscarAsegurado')
        }

    } else {
        res.render('login', {
            title: "Iniciar Sesion"
        });
    }
}
async function verificarComprobanteB(req, res) {
    if (req.isAuthenticated()) {
        try {
            console.log(req.body)
            await poolConnect;
            const result = await request.query(`select * from DocumentoFinanciero where TipoDocumentoFinanciero = 207 and numero = '${req.body.comprobante}'`)
            if (req.body.btnConsultar == '') { //click en consultar
                if (result.recordset[0]) { //1 fila afectada, si existe el num de comprobante
                    console.log(result.recordset[0].FechaHora.toString())
                    req.flash('loginMessage', `Comprobante: ${result.recordset[0].Numero} con fecha: `, result.recordset[0].FechaHora, ' Concepto: ', result.recordset[0].Concepto)
                    req.flash('aux', req.body.codigo)
                    res.redirect('/buscarBeneficiario')
                } else {
                    req.flash('loginMessage', 'Numero de comprobante no existe')
                    req.flash('aux', req.body.codigo)
                    res.redirect('/buscarBeneficiario')
                }
            }
            if (req.body.btnRegistrar == '') { //click en registrar comprobante
                if (result.recordset[0]) { //1 fila afectada, si existe el num de comprobante
                    await poolConnectdb;
                    const result2 = await requestdb.query(`insert into carnet (cod_bnf,id_usuario,created_at,motivo,comprobante,estado,fec_comp) 
                                                    values('${req.body.codigo}',${req.user.id}, CONVERT(VARCHAR,GETDATE(), 103), '${req.body.motivo}', '${result.recordset[0].Numero}', 0, '${result.recordset[0].FechaHora}')`)
                    if (result2.rowsAffected[0] === 1) { //1 fila afectada, se registro correctamente
                        req.flash('loginMessage',`Comprobante: ${req.body.comprobante}, Concepto: ${result.recordset[0].Concepto}`)
                        req.flash('aux', req.body.codigo)
                        res.redirect('/buscarBeneficiario')
                    } else {
                        req.flash('loginMessage', 'Error en el registro del comprobante')
                        req.flash('aux', req.body.codigo)
                        res.redirect('/buscarBeneficiario')
                    }
                } else {
                    req.flash('loginMessage', 'Numero de comprobante no existe')
                    req.flash('aux', req.body.codigo)
                    res.redirect('/buscarBeneficiario')
                }
            }
        } catch (error) {
            console.log('SQL ERROR: ', error)
            req.flash('loginMessage', 'Error en el comprobante')
            req.flash('aux', req.body.codigo)
            res.redirect('/buscarBeneficiario')
        }

    } else {
        res.render('login', {
            title: "Iniciar Sesion"
        });
    }
}

module.exports = {
    verificarComprobanteA,
    verificarComprobanteB
}