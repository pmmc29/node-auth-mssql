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
            const result = await request.query(`SELECT id_carnet,asegurados.cod_asegurado,nombre,login, carnet.created_at,motivo,comprobante,'Asegurado' as tipo,estado FROM carnet,usuarios,asegurados where asegurados.cod_asegurado = '${codigo}'
            and asegurados.cod_asegurado = carnet.cod_asegurado and id_usuario = usuarios.id`)
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

async function verificarCarnetA(req, res) { //ASEGURADOS
    if (req.isAuthenticated()) {
        try {
            await poolConnect;
            console.log(req.body)
            const resultImp = await request.query(`SELECT id_imp,nombre,empresas.nom_emp,fec_ing,asegurados.cod_asegurado,fec_nac,tipo_sangre,imp_carnet.id_carnet,fec_emision,fec_fin,validez
                                            from asegurados,carnet,imp_carnet,empresas
                                            where asegurados.cod_asegurado = '${req.body.codigo}'
                                            and asegurados.cod_asegurado = carnet.cod_asegurado and asegurados.cod_emp = empresas.id_emp
                                            and id_imp = ${req.body.id_imp}`)
            const resultFirmas = await request.query(`select * from firma where estado = '1'`)
            const detalleImp = await request.query(`select * from imp_carnet where id_imp = ${req.body.id_imp}`)
            //nombre y apellido
            console.log('AQUI', resultImp.recordset, resultFirmas.recordset)
            
            let str = resultImp.recordset[0].nombre.split(" ")
            let apellido = str[0] + " " + str[1]
            let nombre = ''
            for (let index = 2; index < str.length; index++) {
                nombre = nombre + " " + str[index]
            }
            if (req.body.btnImprimir == '') { //click en imprimir (historial de carnet)
                QRCode.toDataURL(JSON.stringify({
                            Carnet: req.body.id_carnet,
                            Nombre: resultImp.recordset[0].nombre,
                            "Nº Matricula": resultImp.recordset[0].cod_asegurado
                        }), function (err, url) {
                // QRCode.toDataURL(`http://192.168.1.119:3000/api/getasegurados/${req.body.codigo}`, function (err, url) {
                    res.render('carnet', {
                        menu: '',
                        subm: '',
                        id: req.body.edtBuscar,
                        user: req.user,
                        qr: `${url}`,
                        file: `../photos/Usuarios/${req.user.email}.jpg`,
                        file_carnet: `../photos/Asegurados/${resultImp.recordset[0].nombre}.jpg`,
                        res: resultImp.recordset[0],
                        firmas: resultFirmas.recordset,
                        imp: detalleImp.recordset[0],
                        nombre: nombre,
                        apellido: apellido,
                        titular: ''
                    })
                })
            }
            if (req.body.btnRImprimir == '') { //click en REImprimir
                
                QRCode.toDataURL(JSON.stringify({
                            Carnet: req.body.id_carnet,
                            Nombre: resultImp.recordset[0].nombre,
                            "Nº Matricula": resultImp.recordset[0].cod_asegurado
                        }), function (err, url) {
                // QRCode.toDataURL(`http://192.168.1.119:3000/api/getasegurados/${req.body.codigo}`, function (err, url) {
                    res.render('carnet', {
                        menu: '',
                        subm: '',
                        id: req.body.edtBuscar,
                        user: req.user,
                        qr: `${url}`,
                        file: `../photos/Usuarios/${req.user.email}.jpg`,
                        file_carnet: `../photos/Asegurados/${resultImp.recordset[0].nombre}.jpg`,
                        res: resultImp.recordset[0],
                        firmas: resultFirmas.recordset,
                        imp: detalleImp.recordset[0],
                        nombre: nombre,
                        apellido: apellido,
                        titular: ''
                    })
                })
            }
        } catch (err) {
            console.error('SQL error', err);
            req.flash('aux', req.body.nombre)
            req.flash('loginMessage', 'Error en el Nro. de Comprobante')
            res.redirect('/CARNETIZACION/buscarAsegurado')
        }
    } else {
        res.render('login', {
            title: "Iniciar Sesion"
        });
    }
}
async function verificarCarnetB(req, res) { //BENEFICIARIOS
    if (req.isAuthenticated()) {
        try {
            await poolConnect;
            console.log(req.body)
            const resultImp = await request.query(`SELECT id_imp,nombre,nom_emp,fec_ing,beneficiarios.cod_bnf,fec_nac,tipo_sangre,imp_carnet.id_carnet,fec_emision,fec_fin,validez
                                            from beneficiarios,carnet,imp_carnet
                                            where beneficiarios.cod_bnf = '${req.body.codigo}' and beneficiarios.cod_bnf = carnet.cod_bnf 
                                            and id_imp = ${req.body.id_imp}`)
            const resultFirmas = await request.query(`select * from firma where estado = '1'`)
            const detalleImp = await request.query(`select * from imp_carnet where id_imp = ${req.body.id_imp}`)
            const nom_titular = await request.query(`select asegurados.nombre as titular
                                                    from asegurados,beneficiarios,parentezco where asegurados.agenda = beneficiarios.agenda 
                                                    and parentezco.id_par = beneficiarios.cod_par 
                                                    and asegurados.agenda = (select agenda from beneficiarios where cod_bnf = '${req.body.codigo}')
                                                    and beneficiarios.cod_bnf = '${req.body.codigo}'`);
            //nombre y apellido
            console.log('AQUI', resultImp.recordset, resultFirmas.recordset)
            
            let str = resultImp.recordset[0].nombre.split(" ")
            let apellido = str[0] + " " + str[1]
            let nombre = ''
            for (let index = 2; index < str.length; index++) {
                nombre = nombre + " " + str[index]
            }
            if (req.body.btnImprimir == '') { //click en imprimir (historial de carnet)
                QRCode.toDataURL(JSON.stringify({Carnet:req.body.id_carnet,Nombre:resultImp.recordset[0].nombre}), function (err, url) {
                // QRCode.toDataURL(`http://192.168.1.119:3000/api/getasegurados/${req.body.codigo}`, function (err, url) {
                    res.render('carnet', {
                        menu: '',
                        subm: '',
                        id: req.body.edtBuscar,
                        user: req.user,
                        qr: `${url}`,
                        file: `../photos/Usuarios/${req.user.email}.jpg`,
                        file_carnet: `../photos/Beneficiarios/${resultImp.recordset[0].nombre}.jpg`,
                        res: resultImp.recordset[0],
                        firmas: resultFirmas.recordset,
                        imp: detalleImp.recordset[0],
                        nombre: nombre,
                        apellido: apellido,
                        titular: nom_titular.recordset[0].titular
                    })
                })
            }
            if (req.body.btnRImprimir == '') { //click en REImprimir
                
                QRCode.toDataURL(JSON.stringify({Carnet:req.body.id_carnet,Nombre:resultImp.recordset[0].nombre}), function (err, url) {
                // QRCode.toDataURL(`http://192.168.1.119:3000/api/getasegurados/${req.body.codigo}`, function (err, url) {
                    res.render('carnet', {
                        menu: '',
                        subm: '',
                        id: req.body.edtBuscar,
                        user: req.user,
                        qr: `${url}`,
                        file: `../photos/Usuarios/${req.user.email}.jpg`,
                        file_carnet: `../photos/Beneficiarios/${resultImp.recordset[0].nombre}.jpg`,
                        res: resultImp.recordset[0],
                        firmas: resultFirmas.recordset,
                        imp: detalleImp.recordset[0],
                        nombre: nombre,
                        apellido: apellido,
                        titular: nom_titular.recordset[0].titular
                    })
                })
            }
        } catch (err) {
            console.error('SQL error', err);
            req.flash('aux', req.body.codigo)
            req.flash('loginMessage', 'Error en el Nro. de Comprobante')
            res.redirect('/CARNETIZACION/buscarBeneficiario')
        }
    } else {
        res.render('login', {
            title: "Iniciar Sesion"
        });
    }
}



async function actualizarImp(req, res) { //actualizar impresion del frente y atras
    if (req.isAuthenticated()) {
        try {
            await poolConnect;
            const nom_ase = await request.query(`select nombre from asegurados where cod_asegurado = '${req.body.cod_ase}'`)
            const nom_bnf = await request.query(`select nombre from beneficiarios where cod_bnf = '${req.body.cod_bnf}'`)
            if (req.body.cara === 'front') { //se imprimio el frente del carnet
                console.log(req.body)
                // const carnet = await request.query(`update imp_carnet set front = '1', id_usuario = ${req.user.id} where id_carnet = ${req.body.cod_carnet}`)
                const carnet = await request.query(`update imp_carnet set front = ((select front from imp_carnet where id_imp = ${req.body.cod_carnet} ) +1),id_usuario = ${req.user.id}
                                                    where id_imp = ${req.body.cod_carnet} `)
                console.log(carnet.rowsAffected)
                if (carnet.rowsAffected[0] === 1) { //actualizacion correcta
                    if (req.body.cod_ase) {
                        // req.flash('aux', `${req.body.cod_ase}${req.body.cod_bnf}`)
                        req.flash('aux', `${nom_ase.recordset[0].nombre}`)
                        req.flash('loginMessage', 'Registro de la impresion correcta')
                        res.redirect('/CARNETIZACION/buscarAsegurado')
                    }
                    if (req.body.cod_bnf) {
                        req.flash('aux', `${nom_bnf.recordset[0].nombre}`)
                        req.flash('loginMessage', 'Registro de la impresion correcta')
                        res.redirect('/CARNETIZACION/buscarBeneficiario')
                    }
                }
            }
            if (req.body.cara === 'back') { //se imprimio la parte trasera del carnet
                console.log(req.body)
                // const carnet = await request.query(`update imp_carnet set back = '1', id_usuario = ${req.user.id} where id_carnet = ${req.body.cod_carnet}`)
                const carnet = await request.query(`update imp_carnet set back = ((select back from imp_carnet where id_imp = ${req.body.cod_carnet} ) +1),id_usuario = ${req.user.id}
                                                    where id_imp = ${req.body.cod_carnet} `)
                console.log(carnet.rowsAffected)
                if (carnet.rowsAffected[0] === 1) { //actualizacion correcta
                    // req.flash('aux', `${req.body.cod_ase}${req.body.cod_bnf}`)
                    if (req.body.cod_ase) {
                        // req.flash('aux', `${req.body.cod_ase}${req.body.cod_bnf}`)
                        req.flash('aux', `${nom_ase.recordset[0].nombre}`)
                        req.flash('loginMessage', 'Registro de la impresion correcta')
                        res.redirect('/CARNETIZACION/buscarAsegurado')
                    }
                    if (req.body.cod_bnf) {
                        req.flash('aux', `${nom_bnf.recordset[0].nombre}`)
                        req.flash('loginMessage', 'Registro de la impresion correcta')
                        res.redirect('/CARNETIZACION/buscarBeneficiario')
                    }
                }
            }
            //ESTADO CARNET
            const detalleImp = await request.query(`select * from imp_carnet where id_imp = ${req.body.cod_carnet}`)
            if ((detalleImp.recordset[0].front == 1 && detalleImp.recordset[0].back == 1) || (detalleImp.recordset[0].front > 1 || detalleImp.recordset[0].back > 1)) {
                await request.query(`update imp_carnet set estado = 1 where id_imp = ${req.body.cod_carnet}`)
            }
        } catch (err) {
            console.error('SQL error', err);
            // req.flash('aux', `${req.body.cod_ase}${req.body.cod_bnf}`)
            req.flash('loginMessage', 'Error al registrar la impresion')
            if (req.body.cod_ase) {
                // req.flash('aux', `${req.body.cod_ase}${req.body.cod_bnf}`)
                req.flash('aux', `${nom_ase.recordset[0].nombre}`)
                res.redirect('/CARNETIZACION/buscarAsegurado')
            }
            if (req.body.cod_bnf) {
                req.flash('aux', `${nom_bnf.recordset[0].nombre}`)
                res.redirect('/CARNETIZACION/buscarBeneficiario')
            }
        }
    } else {
        res.render('login', {
            title: "Iniciar Sesion"
        });
    }
}


module.exports = {
    obtenerCarnet,
    verificarCarnetA,
    verificarCarnetB,
    actualizarImp
}