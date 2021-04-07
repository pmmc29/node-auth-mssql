const pool = require('../database');
const poolConnect = pool.connect()
const QRCode = require('qrcode');
const fs = require('fs')
const multer = require('multer')
const path = require('path');

const request = pool.request();

pool.on('error', err => {
    // ... error handler
    console.log(err)
});

//-------------UPLOAD PHOTOS------------------
//Set Storage Engine
const storage = multer.diskStorage({
    destination: path.join(__dirname, '../photos/Asegurados'),
    filename: function (req, file, cb) {
        cb(null, req.body.edtBuscar + '.jpg') //nombre de las fotos
    }
})

const uploadPhoto = multer({
    storage: storage,
    limits: {
        fileSize: 5000000 //bytes = 5mb
    },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb)
    }
}).single('photo_aseg')

function checkFileType(file, cb) {
    //extenciones permitidas
    const filetypes = /jpeg|jpg|png|gif/
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
    //check mime type
    const mimetype = filetypes.test(file.mimetype)

    if (mimetype && extname) {
        return cb(null, true)
    } else {
        cb('Error: Formato no soportado!')
    }
}
//----------------------------------------------

async function obtenerAsegurados(req, res) {
    const codigo = req.params.codigo
    try {
        await poolConnect;
        if (codigo !== undefined) {
            const result2 = await request.query(`select * from asegurados where cod_asegurado = '${codigo}'`)
            res.json(result2.recordset)
        } else {
            const result = await request.query(`select * from asegurados order by nombre`)
            res.json(result.recordset)
        }
    } catch (err) {
        console.error('SQL error', err);
    }
}
async function listAsegurados(req, res) {
    try {
        if (req.isAuthenticated()) {

            await poolConnect;
            const result = await request.query(`select * from asegurados
            order by agenda 
            OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY`)
            // console.log(result.recordset)
            QRCode.toDataURL(JSON.stringify(req.user), function (err, url) {
                // console.log(url)
                res.render('listaAsegurados', {
                    user: req.user,
                    menu: 'Asegurados',
                    subm: 'listaAsegurados',
                    qr: `${url}`,
                    file: `../photos/Usuarios/${req.user.email}.jpg`,
                    res: '',
                    apellido: '',
                    nombre: '',
                    asegurados: result.recordset
                });
            })
            console.log(req.user.id)
        } else {
            res.redirect('/login');
        }
    } catch (err) {
        console.error('SQL error', err);
    }
}

async function btnListaAsegurados(req, res) {
    try {
        if (req.isAuthenticated()) {
            console.log(req.body)
            req.flash('aux', `Accion para el Asegurado ${req.body.cod_ase}`)
            res.redirect('/listaAsegurados')
        } else {
            res.redirect('/login');
        }
    } catch (err) {
        console.error('SQL error', err);
    }
}


async function obtenerInfoAsegurado(req, res) {
    if (req.isAuthenticated()) {
        console.log(req.body)
        if (req.body.btnBuscar == '') { //click en buscar
            await renderDatos(req, res, "Asegurado encontrado")
        }
        if (req.body.btnRegistrar == '') { //click en registrar
            await registrarSangre(req, res)
            console.log(req.body)
        }
    } else {
        res.render('login', {
            title: "Iniciar Sesion"
        });
    }
}
async function agregarFoto(req, res) { //click en agregar foto
    if (req.isAuthenticated()) {
        uploadPhoto(req, res, (err) => {
            if (err) {
                req.flash('loginMessage', 'error')
                req.flash('aux', req.body.edtBuscarNombre)
                res.redirect('/CARNETIZACION/buscarAsegurado')
            } else {
                if (req.file == undefined) {
                    req.flash('loginMessage', 'Seleccione una imagen!')
                    req.flash('aux', req.body.edtBuscarNombre)
                    res.redirect('/CARNETIZACION/buscarAsegurado')
                } else {
                    console.log(req.body)
                    console.log(req.file)
                    req.flash('loginMessage', 'Foto agregada!')
                    req.flash('aux', req.body.edtBuscarNombre)
                    res.redirect('/CARNETIZACION/buscarAsegurado')
                }
            }
        })
    } else {
        res.render('login', {
            title: "Iniciar Sesion"
        });
    }

}

async function registrarSangre(req, res) {
    if (req.isAuthenticated()) {
        try {
            await poolConnect;
            if (req.body.select_sangre === undefined || req.body.ci === undefined || req.body.ci_loc === undefined) {
                console.log(req.body)
                req.flash('loginMessage', 'LLene los campos correspondientes')
                req.flash('aux', req.body.edtBuscarNombre)
                res.redirect('/CARNETIZACION/buscarAsegurado')
            } else {
                const result = await request.query(`update asegurados set tipo_sangre = '${req.body.select_sangre}', ci = '${req.body.ci}', ci_loc ='${req.body.ci_loc}'
                                                where cod_asegurado = '${req.body.edtBuscar}'`)
                const response = result.rowsAffected[0]

                if (response > 0) { // 1 fila afectada = actualizacion exitosa
                    req.flash('loginMessage', 'Registro Exitoso')
                    req.flash('aux', req.body.edtBuscarNombre)
                    res.redirect('/CARNETIZACION/buscarAsegurado')
                } else { // 0 filas afectadas = no se actualizo
                    req.flash('loginMessage', 'Error en el Registro')
                    req.flash('aux', req.body.edtBuscarNombre)
                    res.redirect('/CARNETIZACION/buscarAsegurado')
                }
                console.log(response)
            }
        } catch (err) {
            console.error('SQL error', err);
        }
    } else {
        res.render('login', {
            title: "Iniciar Sesion"
        });
    }
}
async function registrarAsegurado(req, res) {
    if (req.isAuthenticated()) {
        try {
            await poolConnect;
            const body = req.body;
            if (body.select_sangre === '' || body.edtCi === '' || body.ci_loc === '' || body.edtMatricula === '' || body.edtNombre === '' ||
                body.edtEmpresa === '' || body.edtFec_ing === '' || body.edtFec_nac === '') {
                console.log(req.body)
                req.flash('loginMessage', 'LLene todos los campos')
                req.flash('aux', req.body.edtMatricula)
                res.redirect('/CARNETIZACION/registrarAsegurado')
            } else {
                const result = await request.query(`insert into asegurados(cod_asegurado,nombre,fec_nac,ci,ci_loc,cod_emp,fec_ing,tipo_sangre)
                                                    values ('${body.edtMatricula}','${body.edtNombre}','${body.edtFec_nac}','${body.edtCi}','${body.ci_loc}',
                                                            '${parseInt(body.edtEmpresa)}','${body.edtFec_ing}','${body.select_sangre}')`)
                const response = result.rowsAffected[0]
                if (response > 0) { // 1 fila afectada = actualizacion exitosa
                    req.flash('loginMessage', 'Registro Exitoso')
                    res.redirect('/CARNETIZACION/registrarAsegurado')
                } else { // 0 filas afectadas = no se actualizo
                    req.flash('loginMessage', 'Error en el Registro')
                    res.redirect('/CARNETIZACION/registrarAsegurado')
                }
                console.log(response)
            }
        } catch (err) {
            console.error('SQL error', err);
        }
    } else {
        res.render('login', {
            title: "Iniciar Sesion"
        });
    }
}


async function renderDatos(req, res, msg) {
    try {
        await poolConnect;
        const edad_ase = `select DATEDIFF(yy, (select CONVERT(date, (select fec_nac from asegurados where nombre = '${req.body.edtBuscarNombre}'), 103)), GETDATE()) - 
                        CASE
                            WHEN DATEADD(yy, (DATEDIFF(yy, (select CONVERT(date, (select fec_nac from asegurados where nombre = '${req.body.edtBuscarNombre}'), 103)), GETDATE())), (select CONVERT(date, (select fec_nac from asegurados where nombre = '${req.body.edtBuscarNombre}'), 103))) > GETDATE()
                            THEN 1
                            ELSE 0
                        END
                        from asegurados where nombre = '${req.body.edtBuscarNombre}'`
        // const result = await request.query(`select * from asegurados where cod_asegurado = '${req.body.edtBuscar}'`)
        const result = await request.query(`select *, (${edad_ase}) as edad from asegurados where nombre = '${req.body.edtBuscarNombre}'`)
        // const empresa = await request.query(`select empresas.nom_emp from empresas,asegurados where asegurados.cod_emp = empresas.id_emp and asegurados.cod_asegurado = '${req.body.edtBuscar}'`)
        const empresa = await request.query(`select empresas.nom_emp from empresas,asegurados where asegurados.cod_emp = empresas.id_emp and asegurados.nombre = '${req.body.edtBuscarNombre}'`)
        const response = result.recordset[0]
        // console.log(response)
        if (response == undefined) { // no existe el codigo del asegurado
            req.flash('loginMessage', 'Asegurado no encontrado')
            res.redirect('/CARNETIZACION/buscarAsegurado')
        }
        if (response !== undefined) { // asegurado encontrado
            const str = response.nombre.split(" ")
            const apellido = str[0] + " " + str[1]
            let nombre = ''
            for (let index = 2; index < str.length; index++) {
                nombre = nombre + " " + str[index]
            }
            const carnet = await request.query(`SELECT imp_carnet.id_carnet,id_imp, asegurados.cod_asegurado, nombre, login, imp_carnet.fec_emision, imp_carnet.motivo, comprobante, imp_carnet.estado,
                                                fec_fin, front, back,imp_carnet.validez, CONVERT(VARCHAR, GETDATE(), 103) as fec_servidor
                                                FROM asegurados, usuarios, imp_carnet, carnet
                                                where asegurados.cod_asegurado = '${response.cod_asegurado}'
                                                and asegurados.cod_asegurado = carnet.cod_asegurado
                                                and imp_carnet.id_usuario = usuarios.id and imp_carnet.id_carnet = carnet.id_carnet `)
            console.log(carnet.recordset)
            let file_test = `./src/photos/Asegurados/${response.cod_asegurado}.jpg`
            let file_ase = ''
            fs.access(file_test, fs.constants.F_OK, (err) => {
                if (err) {
                    // console.error(err)
                    file_ase = ''
                    return
                }
                //file exists
                file_ase = `../photos/Asegurados/${response.cod_asegurado}.jpg`
            })

            QRCode.toDataURL(JSON.stringify(req.user), function (err, url) {
                res.render('buscarAsegurado', {
                    message: msg,
                    menu: 'Asegurados',
                    subm: 'buscarAsegurado',
                    id: req.body.edtBuscarNombre,
                    user: req.user,
                    qr: `${url}`,
                    file: `../photos/Usuarios/${req.user.email}.jpg`,
                    file_ase: file_ase,
                    res: response,
                    apellido: apellido,
                    nombre: nombre,
                    codigo: response.cod_asegurado,
                    historial: carnet.recordset,
                    new_emp: empresa.recordset[0]
                })
            })
        }
    } catch (err) {
        console.error('SQL error', err);
        req.flash('loginMessage', 'ERROR')
        res.redirect('/CARNETIZACION/buscarAsegurado')
    }
}

module.exports = {
    obtenerAsegurados,
    obtenerInfoAsegurado,
    listAsegurados,
    btnListaAsegurados,
    agregarFoto,
    registrarAsegurado
}