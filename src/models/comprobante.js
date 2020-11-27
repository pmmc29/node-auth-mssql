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
            if (req.body.btnRegistrar == '') { //click en registrar comprobante
                if (result.recordset[0]) { //1 fila afectada, si existe el num de comprobante
                    await poolConnectdb;
                    if (req.body.validez == 'CONTRATO') {
                        const imp_carnet = await requestdb.query(`insert into imp_carnet (id_carnet,front,back,fec_emision,estado,id_usuario,validez,comprobante,motivo,fec_fin) 
                                                values((select id_carnet from carnet where cod_asegurado = '${req.body.codigo}'),'0','0', CONVERT(VARCHAR,GETDATE(), 103), '0',
                                                ${req.user.id}, '${req.body.validez}','${result.recordset[0].Numero}','${req.body.motivo}','${req.body.fec_contrato}')`)
                        if (imp_carnet.rowsAffected[0] === 1) { //1 fila afectada, se registro correctamente
                            req.flash('loginMessage', `Comprobante: ${req.body.comprobante}, Concepto: ${result.recordset[0].Concepto}`)
                            req.flash('aux', req.body.codigo)
                            res.redirect('/buscarAsegurado')
                        } else {
                            req.flash('loginMessage', 'Error en el registro del comprobante')
                            req.flash('aux', req.body.codigo)
                            res.redirect('/buscarAsegurado')
                        }
                    }
                    if (req.body.validez == 'ITEM') {
                        const imp_carnet = await requestdb.query(`insert into imp_carnet (id_carnet,front,back,fec_emision,estado,id_usuario,validez,comprobante,motivo,fec_fin) 
                                                values((select id_carnet from carnet where cod_asegurado = '${req.body.codigo}'),'0','0', CONVERT(VARCHAR,GETDATE(), 103), '0',
                                                ${req.user.id}, '${req.body.validez}','${result.recordset[0].Numero}','${req.body.motivo}',CONVERT(VARCHAR, (select DATEADD(yyyy, 3, GETDATE())), 103))`)
                        if (imp_carnet.rowsAffected[0] === 1) { //1 fila afectada, se registro correctamente
                            req.flash('loginMessage', `Comprobante: ${req.body.comprobante}, Concepto: ${result.recordset[0].Concepto}`)
                            req.flash('aux', req.body.codigo)
                            res.redirect('/buscarAsegurado')
                        } else {
                            req.flash('loginMessage', 'Error en el registro del comprobante')
                            req.flash('aux', req.body.codigo)
                            res.redirect('/buscarAsegurado')
                        }
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
            await poolConnectdb;
            const result = await request.query(`select * from DocumentoFinanciero where TipoDocumentoFinanciero = 207 and numero = '${req.body.comprobante}'`)
            if (req.body.btnRegistrar == '') { //click en registrar comprobante
                if (result.recordset[0]) { //1 fila afectada, si existe el num de comprobante
                    if (req.body.tipo == 'MENOR') {
                        if (parseInt(req.body.edad) + 3 >= 19) {
                            const new_fec_fin = `CONVERT(VARCHAR, (select DATEADD(yy, 19, (select CONVERT(date, (select fec_nac from beneficiarios where cod_bnf = '${req.body.codigo}'), 103)))), 103)`
                            const imp_carnet = await requestdb.query(`insert into imp_carnet (id_carnet,front,back,fec_emision,estado,id_usuario,validez,comprobante,motivo,fec_fin) 
                                                    values((select id_carnet from carnet where cod_bnf = '${req.body.codigo}'),'0','0', CONVERT(VARCHAR,GETDATE(), 103), '0',
                                                    ${req.user.id}, '${req.body.tipo}','${result.recordset[0].Numero}','${req.body.motivo}',${new_fec_fin})`)
                            if (imp_carnet.rowsAffected[0] === 1) { //1 fila afectada, se registro correctamente
                                req.flash('loginMessage', `Comprobante: ${req.body.comprobante}, Concepto: ${result.recordset[0].Concepto}`)
                                req.flash('aux', req.body.codigo)
                                res.redirect('/buscarBeneficiario')
                            } else {
                                req.flash('loginMessage', 'Error en el registro del comprobante')
                                req.flash('aux', req.body.codigo)
                                res.redirect('/buscarBeneficiario')
                            }
                        }
                        if (parseInt(req.body.edad) + 3 < 19) {
                            const imp_carnet = await requestdb.query(`insert into imp_carnet (id_carnet,front,back,fec_emision,estado,id_usuario,validez,comprobante,motivo,fec_fin) 
                                                    values((select id_carnet from carnet where cod_bnf = '${req.body.codigo}'),'0','0', CONVERT(VARCHAR,GETDATE(), 103), '0',
                                                    ${req.user.id}, '${req.body.tipo}','${result.recordset[0].Numero}','${req.body.motivo}',CONVERT(VARCHAR, (select DATEADD(yyyy, 3, GETDATE())), 103))`)
                            if (imp_carnet.rowsAffected[0] === 1) { //1 fila afectada, se registro correctamente
                                req.flash('loginMessage', `Comprobante: ${req.body.comprobante}, Concepto: ${result.recordset[0].Concepto}`)
                                req.flash('aux', req.body.codigo)
                                res.redirect('/buscarBeneficiario')
                            } else {
                                req.flash('loginMessage', 'Error en el registro del comprobante')
                                req.flash('aux', req.body.codigo)
                                res.redirect('/buscarBeneficiario')
                            }
                        }
                    }
                    if (req.body.tipo == 'MAYOR') {
                        let meses = ''
                        switch (req.body.validez) {
                            case 'MODULAR':
                                meses = 1
                                break;
                            case 'TRIMESTRAL':
                                meses = 3
                                break;
                            case 'SEMESTRAL':
                                meses = 6
                                break;
                            case 'ANUAL':
                                meses = 12
                                break;
                            default:
                                break;
                        }
                        const dias_rest = await requestdb.query(`SELECT DATEDIFF(day, DATEADD(mm, ${meses}, GETDATE()), 
                        DATEADD(yy, 25, (select CONVERT(date, (select fec_nac from beneficiarios where cod_bnf = '${req.body.codigo}'), 103)))) AS dias_rest`)
                        const current_year = await requestdb.query(`SELECT DATEDIFF(day, DATEADD(mm, ${meses}, GETDATE()), CONCAT(YEAR(GETDATE()), '-12-31')) AS current_year`)
                        console.log(dias_rest.recordset[0].dias_rest)
                        if (current_year.recordset[0].current_year >= 0) { //tiene dias sobrantes al año actual
                            if (dias_rest.recordset[0].dias_rest >= 0) {//tiene dias sobrantes para sus 25 -> se registra con los meses especificados
                                const imp_carnet = await requestdb.query(`insert into imp_carnet (id_carnet,front,back,fec_emision,estado,id_usuario,validez,comprobante,motivo,fec_fin) 
                                                        values((select id_carnet from carnet where cod_bnf = '${req.body.codigo}'),'0','0', CONVERT(VARCHAR,GETDATE(), 103), '0',
                                                        ${req.user.id}, '${req.body.validez}','${result.recordset[0].Numero}','${req.body.motivo}',CONVERT(VARCHAR, DATEADD(mm, ${meses}, GETDATE()), 103))`)
                                if (imp_carnet.rowsAffected[0] === 1) { //1 fila afectada, se registro correctamente
                                    req.flash('loginMessage', `Comprobante: ${req.body.comprobante}, Concepto: ${result.recordset[0].Concepto}`)
                                    req.flash('aux', req.body.codigo)
                                    res.redirect('/buscarBeneficiario')
                                } else {
                                    req.flash('loginMessage', 'Error en el registro del comprobante')
                                    req.flash('aux', req.body.codigo)
                                    res.redirect('/buscarBeneficiario')
                                }
                            }
                            if (dias_rest.recordset[0].dias_rest < 0) {
                                const new_fec_fin = `CONVERT(VARCHAR, (select DATEADD(yy, 25, (select CONVERT(date, (select fec_nac from beneficiarios where cod_bnf = '${req.body.codigo}'), 103)))), 103)`
                                const imp_carnet = await requestdb.query(`insert into imp_carnet (id_carnet,front,back,fec_emision,estado,id_usuario,validez,comprobante,motivo,fec_fin) 
                                                    values((select id_carnet from carnet where cod_bnf = '${req.body.codigo}'),'0','0', CONVERT(VARCHAR,GETDATE(), 103), '0',
                                                    ${req.user.id}, '${req.body.validez}','${result.recordset[0].Numero}','${req.body.motivo}',${new_fec_fin})`)
                                if (imp_carnet.rowsAffected[0] === 1) { //1 fila afectada, se registro correctamente
                                    req.flash('loginMessage', `Comprobante: ${req.body.comprobante}, Concepto: ${result.recordset[0].Concepto}`)
                                    req.flash('aux', req.body.codigo)
                                    res.redirect('/buscarBeneficiario')
                                } else {
                                    req.flash('loginMessage', 'Error en el registro del comprobante')
                                    req.flash('aux', req.body.codigo)
                                    res.redirect('/buscarBeneficiario')
                                }
                            }
                        }
                        if (current_year.recordset[0].current_year < 0) { //no tiene dias restantes en el año actual -> se limita la fecha de validez al 31/12
                            if (dias_rest.recordset[0].dias_rest < 0 && current_year.recordset[0].current_year < 0) { //no tiene dias restantes para sus 25 -> se limita a la fecha de su cumpleaños 25
                                const new_fec_fin = `CONVERT(VARCHAR, (select DATEADD(yy, 25, (select CONVERT(date, (select fec_nac from beneficiarios where cod_bnf = '${req.body.codigo}'), 103)))), 103)`
                                const imp_carnet = await requestdb.query(`insert into imp_carnet (id_carnet,front,back,fec_emision,estado,id_usuario,validez,comprobante,motivo,fec_fin) 
                                                    values((select id_carnet from carnet where cod_bnf = '${req.body.codigo}'),'0','0', CONVERT(VARCHAR,GETDATE(), 103), '0',
                                                    ${req.user.id}, '${req.body.validez}','${result.recordset[0].Numero}','${req.body.motivo}',${new_fec_fin})`)
                                if (imp_carnet.rowsAffected[0] === 1) { //1 fila afectada, se registro correctamente
                                    req.flash('loginMessage', `Comprobante: ${req.body.comprobante}, Concepto: ${result.recordset[0].Concepto}`)
                                    req.flash('aux', req.body.codigo)
                                    res.redirect('/buscarBeneficiario')
                                } else {
                                    req.flash('loginMessage', 'Error en el registro del comprobante')
                                    req.flash('aux', req.body.codigo)
                                    res.redirect('/buscarBeneficiario')
                                }
                            }else{
                                const new_fec_fin = `CONCAT('31/12/',YEAR(GETDATE()))`
                                const imp_carnet = await requestdb.query(`insert into imp_carnet (id_carnet,front,back,fec_emision,estado,id_usuario,validez,comprobante,motivo,fec_fin) 
                                                        values((select id_carnet from carnet where cod_bnf = '${req.body.codigo}'),'0','0', CONVERT(VARCHAR,GETDATE(), 103), '0',
                                                        ${req.user.id}, '${req.body.validez}','${result.recordset[0].Numero}','${req.body.motivo}',${new_fec_fin})`)
                                if (imp_carnet.rowsAffected[0] === 1) { //1 fila afectada, se registro correctamente
                                    req.flash('loginMessage', `Comprobante: ${req.body.comprobante}, Concepto: ${result.recordset[0].Concepto}`)
                                    req.flash('aux', req.body.codigo)
                                    res.redirect('/buscarBeneficiario')
                                } else {
                                    req.flash('loginMessage', 'Error en el registro del comprobante')
                                    req.flash('aux', req.body.codigo)
                                    res.redirect('/buscarBeneficiario')
                                }
                            }
                        }
                    }
                    if (req.body.tipo == 'RECUPERADO') {
                        // const dias_rest = await requestdb.query(`SELECT DATEDIFF(day, DATEADD(mm, ${meses}, GETDATE()), 
                        // DATEADD(yy, 25, (select CONVERT(date, (select fec_nac from beneficiarios where cod_bnf = '${req.body.codigo}'), 103)))) AS dias_rest`)
                        // console.log(dias_rest.recordset[0].dias_rest)
                        // if (dias_rest.recordset[0].dias_rest >= 0) {//tiene dias sobrantes -> se registra con los meses especificados
                        //     const imp_carnet = await requestdb.query(`insert into imp_carnet (id_carnet,front,back,fec_emision,estado,id_usuario,validez,comprobante,motivo,fec_fin) 
                        //                             values((select id_carnet from carnet where cod_bnf = '${req.body.codigo}'),'0','0', CONVERT(VARCHAR,GETDATE(), 103), '0',
                        //                             ${req.user.id}, '${req.body.validez}','${result.recordset[0].Numero}','${req.body.motivo}',CONVERT(VARCHAR, DATEADD(mm, ${meses}, GETDATE()), 103))`)
                        //     if (imp_carnet.rowsAffected[0] === 1) { //1 fila afectada, se registro correctamente
                        //         req.flash('loginMessage', `Comprobante: ${req.body.comprobante}, Concepto: ${result.recordset[0].Concepto}`)
                        //         req.flash('aux', req.body.codigo)
                        //         res.redirect('/buscarBeneficiario')
                        //     } else {
                        //         req.flash('loginMessage', 'Error en el registro del comprobante')
                        //         req.flash('aux', req.body.codigo)
                        //         res.redirect('/buscarBeneficiario')
                        //     }
                        // }
                        // if (dias_rest.recordset[0].dias_rest < 0) {//no tiene dias restantes -> se limita la fecha de validez a su cumpleaños 25
                        //     const new_fec_fin = `CONVERT(VARCHAR, (select DATEADD(yy, 25, (select CONVERT(date, (select fec_nac from beneficiarios where cod_bnf = '${req.body.codigo}'), 103)))), 103)`
                        //     const imp_carnet = await requestdb.query(`insert into imp_carnet (id_carnet,front,back,fec_emision,estado,id_usuario,validez,comprobante,motivo,fec_fin) 
                        //                             values((select id_carnet from carnet where cod_bnf = '${req.body.codigo}'),'0','0', CONVERT(VARCHAR,GETDATE(), 103), '0',
                        //                             ${req.user.id}, '${req.body.validez}','${result.recordset[0].Numero}','${req.body.motivo}',${new_fec_fin})`)
                        //     if (imp_carnet.rowsAffected[0] === 1) { //1 fila afectada, se registro correctamente
                        //         req.flash('loginMessage', `Comprobante: ${req.body.comprobante}, Concepto: ${result.recordset[0].Concepto}`)
                        //         req.flash('aux', req.body.codigo)
                        //         res.redirect('/buscarBeneficiario')
                        //     } else {
                        //         req.flash('loginMessage', 'Error en el registro del comprobante')
                        //         req.flash('aux', req.body.codigo)
                        //         res.redirect('/buscarBeneficiario')
                        //     }
                        // }
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