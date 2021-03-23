const sql = require('mssql')
const {
    config
} = require('../database')
const QRCode = require('qrcode')
const path = require('path');
var Client = require('ftp');
const fs = require('fs')
const csv = require('csvtojson');

const new_pool = new sql.ConnectionPool(config);
const poolConnect = new_pool.connect();
// const transaction = new sql.Transaction(new_pool)
const request = new sql.Request(new_pool)


let txt_files = []


new_pool.on('error', err => {
    // ... error handler
    console.log(err)
});


//////////////////////////////////////////////////////////////
// var options = {
//     host: 'localhost',
//     user: 'test',
//     password: '123'
// }
var options = {
    host: '192.168.100.174',
    user: 'pedrom',
    password: 'pedro2020'
}

var c = new Client();
c.connect(options);
c.on('ready', function () {
    c.list(function (err, list) {
        if (err) throw err;
        if (txt_files.length == 0) {
            for (let i = 0; i < list.length; i++) {
                if (path.extname(list[i].name) == '.txt') {
                    txt_files.push({
                        bdname: list[i].name
                    })
                }
            }
        }
        console.log(txt_files)
        c.end();
    });
});
c.on('error', err => {
    // ... error handler
    console.log(err)
});
//////////////////////////////////////////////////////////////


async function updateAsegurados(req, res) {
    try {
        await poolConnect; // ensures that the pool has been created
        const file_asegurados = `./src/dbfiles/new_asegurados.txt`;
        csv({
                delimiter: ["|"],
                noheader: true,
                headers: ['agenda', 'cod_asegurado', 'nombre', 'fec_nac', 'sexo', 'ci', 'ci_loc', 'cod_emp', 'nom_emp', 'fec_ing', 'tipo_sangre']
            })
            .fromFile(file_asegurados)
            .then(async (jsonObj) => {
                // ... error checks
                jsonObj.forEach(async (e) => {
                    // table.rows.add(parseInt(e.agenda), e.cod_asegurado, e.nombre, e.fec_nac, e.sexo, e.ci, e.ci_loc,
                    //     parseInt(e.cod_emp), e.nom_emp, e.fec_ing, e.tipo_sangre)
                    await request.query(`if not exists (select 1 from asegurados where cod_asegurado = '${e.cod_asegurado}')
                                            insert into asegurados(agenda,cod_asegurado,nombre,fec_nac,sexo,ci,ci_loc,cod_emp,nom_emp,fec_ing,tipo_sangre) 
                                            values(${parseInt(e.agenda)},'${e.cod_asegurado}','${e.nombre}','${e.fec_nac}','${e.sexo}',
                                            '${e.ci}','${e.ci_loc}',${parseInt(e.cod_emp)},'${e.nom_emp}','${e.fec_ing}','${e.tipo_sangre}')
                                        else
                                            update asegurados set agenda=${parseInt(e.agenda)},cod_asegurado='${e.cod_asegurado}',nombre='${e.nombre}',
                                            fec_nac='${e.fec_nac}',sexo='${e.sexo}',ci='${e.ci}',ci_loc='${e.ci_loc}',cod_emp=${parseInt(e.cod_emp)},
                                            nom_emp='${e.nom_emp}',fec_ing='${e.fec_ing}'
                                            where cod_asegurado = '${e.cod_asegurado}'`)
                });
            })
    } catch (err) {
        throw (err)
    }
}

async function updateBeneficiarios(req, res) {
    try {
        await poolConnect; // ensures that the pool has been created
        const file_bnf = `./src/dbfiles/new_beneficiarios.txt`;
        csv({
                delimiter: ["|"],
                noheader: true,
                headers: ['agenda', 'cod_bnf', 'nombre', 'fec_nac', 'sexo', 'cod_par', 'cod_emp', 'nom_emp', 'tipo_sangre']
            })
            .fromFile(file_bnf)
            .then(async (jsonObj) => {
                // ... error checks
                jsonObj.forEach(async (e) => {
                    // table.rows.add(parseInt(e.agenda), e.cod_asegurado, e.nombre, e.fec_nac, e.sexo, e.ci, e.ci_loc,
                    //     parseInt(e.cod_emp), e.nom_emp, e.fec_ing, e.tipo_sangre)
                    await request.query(`if not exists (select 1 from beneficiarios where cod_bnf = '${e.cod_bnf}')
                                             insert into beneficiarios(agenda,cod_bnf,nombre,fec_nac,sexo,cod_par,cod_emp,nom_emp,tipo_sangre) 
                                             values(${parseInt(e.agenda)},'${e.cod_bnf}','${e.nombre}','${e.fec_nac}','${e.sexo}',
                                             ${parseInt(e.cod_par)},${parseInt(e.cod_emp)},'${e.nom_emp}','${e.tipo_sangre}')
                                         else
                                             update beneficiarios set agenda=${parseInt(e.agenda)},cod_bnf='${e.cod_bnf}',nombre='${e.nombre}',
                                             fec_nac='${e.fec_nac}',sexo='${e.sexo}',cod_par=${parseInt(e.cod_par)},cod_emp=${parseInt(e.cod_emp)},
                                             nom_emp='${e.nom_emp}'
                                             where cod_bnf = '${e.cod_bnf}'`);
                });
            })
    } catch (err) {
        throw (err)
    }
}

async function updateEmpresas(req, res) {
    try {
        await poolConnect; // ensures that the pool has been created
        const file_empresas = `./src/dbfiles/new_empresas.txt`;
        csv({
                delimiter: ["|"],
                noheader: true,
                headers: ['id_emp', 'nom_emp', 'programa']
            })
            .fromFile(file_empresas)
            .then(async (jsonObj) => {
                // ... error checks
               jsonObj.forEach(async (e) => {
                    await request.query(`if not exists (select 1 from empresas where id_emp = '${parseInt(e.id_emp)}')
                                            insert into empresas(id_emp, nom_emp, programa) values(${parseInt(e.id_emp)},'${e.nom_emp}','${e.programa}')
                                        else
                                            update empresas set id_emp=${parseInt(e.id_emp)},nom_emp='${e.nom_emp}',programa='${e.programa}'
                                            where id_emp = '${e.id_emp}'`);
                });
            })
    } catch (err) {
        throw (err)
    }
}

function descargarFTP(req, res, txtname) {
    try {
        var ftp = new Client();
        ftp.connect(options);
        ftp.on('ready', function () {
            ftp.get(`${req.body.bdname}`, function (err, stream) {
                if (err) {
                    req.flash('aux', `${err}`)
                    res.redirect('/actualizarBD')
                } else {
                    // stream.once('close', function () {c.end();});
                    stream.pipe(fs.createWriteStream(`./src/dbfiles/${txtname}.txt`));
                    req.flash('aux', `Archivo descargado Correctamente.`)
                    res.redirect('/actualizarBD')
                }
            });
        });
    } catch (error) {
        req.flash('aux', `${error}`)
        res.redirect('/actualizarBD')
    }
}

async function actualizarBD(req, res, next) {
    try {
        if (req.isAuthenticated()) {
            await poolConnect;
            console.log(req.body)
            if (req.body.btn_actualizar_emp == '') { //click en actualizar empresas
                updateEmpresas(req, res)
                await request.query(`insert into updates(tabla,fec_creado,id_usuario)  
                                    values (3,(CONVERT(VARCHAR, GETDATE(), 103) + ' ' + CONVERT(VARCHAR, GETDATE(), 8)),${req.user.id})`);
                req.flash('aux', `Empresas actualizadas!`)
                res.redirect('/actualizarBD')
            }
            if (req.body.btn_actualizar_ase == '') { //click en actualizar asegurados
                updateAsegurados(req,res)  
                await request.query(`insert into updates(tabla,fec_creado,id_usuario)  
                                    values (1,(CONVERT(VARCHAR, GETDATE(), 103) + ' ' + CONVERT(VARCHAR, GETDATE(), 8)),${req.user.id})`);
                req.flash('aux', `Asegurados actualizados!`)
                res.redirect('/actualizarBD')
            }
            if (req.body.btn_actualizar_bnf == '') { //click en actualizar beneficiarios
                updateBeneficiarios(req,res)    
                await request.query(`insert into updates(tabla,fec_creado,id_usuario)  
                                    values (2,(CONVERT(VARCHAR, GETDATE(), 103) + ' ' + CONVERT(VARCHAR, GETDATE(), 8)),${req.user.id})`);            
                req.flash('aux', `Beneficiarios actualizados!`)
                res.redirect('/actualizarBD')
            }
            if (req.body.btn_descargar_ase == '') { //click en DESCARGAR asegurados
                descargarFTP(req, res, 'new_asegurados')
            }
            if (req.body.btn_descargarbd_bnf == '') { //click en DESCARGAR beneficiarios
                descargarFTP(req, res, 'new_beneficiarios')
            }
            if (req.body.btn_descargar_emp == '') { //click en DESCARGAR empresas
                descargarFTP(req, res, 'new_empresas')
            }
        } else {
            res.redirect('/login');
        }
    } catch (e) {
        req.flash('aux', `${e}`)
        res.redirect('/actualizarBD')
        // throw (e)
    }
}

async function renderView(req, res) {
    if (req.isAuthenticated()) {
        const count_emp = await request.query(`select count(*) as count_emp from empresas`)
        const count_ase = await request.query(`select count(*) as count_ase from asegurados`)
        const count_bnf = await request.query(`select count(*) as count_bnf from beneficiarios`)

        const fec_upd = await request.query(`select (select top 1 fec_creado
                                            from updates 
                                            where tabla = 1
                                            ORDER BY id_update
                                            DESC) as ase,
                                            (select top 1 fec_creado
                                            from updates 
                                            where tabla = 2
                                            ORDER BY id_update
                                            DESC) as bnf,
                                            (select top 1 fec_creado
                                            from updates 
                                            where tabla = 3
                                            ORDER BY id_update
                                            DESC) as emp`)

        QRCode.toDataURL(JSON.stringify(req.user), function (err, url) {
            // console.log(url)
            res.render('actualizarBD', {
                user: req.user,
                menu: 'Base de Datos',
                subm: 'actualizarBD',
                qr: `${url}`,
                file: `../photos/Usuarios/${req.user.email}.jpg`,
                bds: txt_files,
                count: {emp: count_emp.recordset[0].count_emp,
                        ase:count_ase.recordset[0].count_ase,
                        bnf: count_bnf.recordset[0].count_bnf},
                fec_upd: fec_upd.recordset[0]
            });
        })
        console.log(req.user.id)
    } else {
        res.redirect('/login');
    }
}

module.exports = {
    renderView,
    actualizarBD
}