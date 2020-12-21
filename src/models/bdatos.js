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
                headers: ['agenda', 'cod_asegurado', 'nombre', 'fec_nac', 'sexo', 'ci', 'ci_loc', 'cod_emp', 'nom_emp', 'fec_ing', 'tipo_sangre']
            })
            .fromFile(file_asegurados)
            .then(async (jsonObj) => {
                // ... error checks
                jsonObj.forEach(async (e) => {
                    // table.rows.add(parseInt(e.agenda), e.cod_asegurado, e.nombre, e.fec_nac, e.sexo, e.ci, e.ci_loc,
                    //     parseInt(e.cod_emp), e.nom_emp, e.fec_ing, e.tipo_sangre)
                    await request.query(`if not exists (select 1 from test_ase where cod_asegurado = '${e.cod_asegurado}')
                                            insert into test_ase values(${parseInt(e.agenda)},'${e.cod_asegurado}','${e.nombre}','${e.fec_nac}','${e.sexo}',
                                            '${e.ci}','${e.ci_loc}',${parseInt(e.cod_emp)},'${e.nom_emp}','${e.fec_ing}','${e.tipo_sangre}')
                                        else
                                            update test_ase set agenda=${parseInt(e.agenda)},cod_asegurado='${e.cod_asegurado}',nombre='${e.nombre}',
                                            fec_nac='${e.fec_nac}',sexo='${e.sexo}',ci='${e.ci}',ci_loc='${e.ci_loc}',cod_emp=${parseInt(e.cod_emp)},
                                            nom_emp='${e.nom_emp}',fec_ing='${e.fec_ing}'
                                            where cod_asegurado = '${e.cod_asegurado}'`)
                });
            }).then(() => {
                req.flash('aux', `Asegurados actualizados!`)
                res.redirect('/actualizarBD')
            })
    } catch (err) {
        throw (err)
    }
}


async function updateBeneficiarios() {
    try {
        await poolConnect; // ensures that the pool has been created
        const file_bnf = './src/dbfiles/new_beneficiarios.txt';
        const request = pool.request(); // or: new sql.Request(pool1)
        csv({
                delimiter: ["|"],
                headers: ['agenda', 'cod_bnf', 'nombre', 'fec_nac', 'sexo', 'cod_par', 'cod_emp', 'nom_emp', 'tipo_sangre']
            })
            .fromFile(file_bnf)
            .then((bnfObj) => {
                var bar = new Promise((resolve, reject) => {
                    bnfObj.forEach((e, index, array) => {
                        request.query(`if not exists (select 1 from test_bnf where cod_bnf = '${e.cod_bnf}')
                                            insert into test_bnf(agenda,cod_bnf,nombre,fec_nac,sexo,cod_par,cod_emp,nom_emp,tipo_sangre) 
                                            values(${parseInt(e.agenda)},'${e.cod_bnf}','${e.nombre}','${e.fec_nac}','${e.sexo}',
                                            ${parseInt(e.cod_par)},${parseInt(e.cod_emp)},'${e.nom_emp}','${e.tipo_sangre}')
                                        else
                                            update test_bnf set agenda=${parseInt(e.agenda)},cod_bnf='${e.cod_bnf}',nombre='${e.nombre}',
                                            fec_nac='${e.fec_nac}',sexo='${e.sexo}',cod_par=${parseInt(e.cod_par)},cod_emp=${parseInt(e.cod_emp)},
                                            nom_emp='${e.nom_emp}'
                                            where cod_bnf = '${e.cod_bnf}'`)
                        // console.log(e)
                        if (index === array.length - 1) resolve();
                    });
                });
            }).then(() => {
                req.flash('aux', `Beneficiarios actualizados!`)
                res.redirect('/actualizarBD')
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
                headers: ['id_emp', 'nom_emp', 'programa']
            })
            .fromFile(file_empresas)
            .then(async (jsonObj) => {
                // ... error checks
               jsonObj.forEach(async (e) => {
                    // table.rows.add(parseInt(e.agenda), e.cod_asegurado, e.nombre, e.fec_nac, e.sexo, e.ci, e.ci_loc,
                    //     parseInt(e.cod_emp), e.nom_emp, e.fec_ing, e.tipo_sangre)
                    await request.query(`if not exists (select 1 from test_emp where id_emp = '${parseInt(e.id_emp)}')
                                            insert into test_emp(id_emp, nom_emp, programa) values(${parseInt(e.id_emp)},'${e.nom_emp}','${e.programa}')
                                        else
                                            update test_emp set id_emp=${parseInt(e.id_emp)},nom_emp='${e.nom_emp}',programa='${e.programa}'
                                            where id_emp = '${e.id_emp}'`);
                });
            }).then(()=>{
                req.flash('aux', `Empresas actualizadas!`)
                res.redirect('/actualizarBD')
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
            if (req.body.btn_actualizar_emp == '') { //click en actualizar asegurados
                updateEmpresas(req, res)
            }
            if (req.body.btn_actualizar_ase == '') { //click en actualizar Asegurados
                // updateBeneficiarios(req,res)
                updateAsegurados(req,res)                
            }
            // if (req.body.btn_actualizarbd_emp == '') { //click en actualizar empresas
            //     updateEmpresas(req,res)                
            // }
            if (req.body.btn_descargarbd_ase == '') { //click en DESCARGAR asegurados
                descargarFTP(req, res, 'test_ase')
            }
            if (req.body.btn_descargarbd_bnf == '') { //click en DESCARGAR beneficiarios
                descargarFTP(req, res, 'test_bnf')
            }
            if (req.body.btn_descargarbd_emp == '') { //click en DESCARGAR empresas
                descargarFTP(req, res, 'test_emp')
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
        const count_emp = await request.query(`select count(*) as count_emp from test_emp `)
        const count_ase = await request.query(`select count(*) as count_ase from test_ase `)
        const count_bnf = await request.query(`select count(*) as count_bnf from test_bnf `)
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
                        bnf: count_bnf.recordset[0].count_bnf}
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