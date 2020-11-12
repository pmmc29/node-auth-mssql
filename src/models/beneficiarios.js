const pool = require('../database');
const poolConnect = pool.connect();
const QRCode = require('qrcode')
const fs = require('fs')
const multer = require('multer')
const path = require('path')

const request = pool.request(); // or: new sql.Request(pool1)

pool.on('error', err => {
    // ... error handler
    console.log(err)
});

//-------------UPLOAD PHOTOS------------------
//Set Storage Engine
const storage = multer.diskStorage({
    destination: path.join(__dirname, '../photos/Beneficiarios'),
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
}).single('photo_bnf')

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

async function obtenerBeneficiarios(req, res) {
    const codigo = req.params.codigo
    try {
        await poolConnect;
        if (codigo !== undefined) {
            const result2 = await request.query(`select * from beneficiarios where cod_bnf = '${codigo}'`)
            res.json(result2.recordset)
        } else {
            const result = await request.query(`select * from beneficiarios order by agenda`)
            res.json(result.recordset)
        }
    } catch (err) {
        console.error('SQL error', err);
    }
}
async function listaBeneficiarios(req, res) {
    try {
        if (req.isAuthenticated()) {

            await poolConnect;
            const result = await request.query(`select * from asegurados
            order by name 
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

async function btnListaBeneficiarios(req, res) {
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


async function obtenerInfoBeneficiario(req, res) {
    if (req.isAuthenticated()) {
        if (req.body.btnBuscar != undefined) { //click en buscar
            await renderDatos(req, res, "Beneficiario encontrado")
        }
        if (req.body.btnRegistrar != undefined) { //click en registrar
            await registrarDatos(req, res)
        }
    } else {
        res.render('login', {
            title: "Iniciar Sesion"
        });
    }
}

async function agregarFotoB(req, res) {//click en agregar foto
    if (req.isAuthenticated()) {
            uploadPhoto(req, res, (err) => {
                    if (err) {
                        req.flash('loginMessage', err)
                        req.flash('aux', req.body.edtBuscar)
                        res.redirect('/buscarBeneficiario')
                    } else {
                        if (req.file == undefined) {
                            console.log(req.body,req.file)
                            req.flash('loginMessage', 'Seleccione una imagen!')
                            req.flash('aux', req.body.edtBuscar)
                            res.redirect('/buscarBeneficiario')
                        } else {
                            console.log(req.body)
                            console.log(req.file)
                            req.flash('loginMessage', 'Foto agregada!')
                            req.flash('aux', req.body.edtBuscar)
                            res.redirect('/buscarBeneficiario')
                        }
                    }
                })
    } else {
        res.render('login', {
            title: "Iniciar Sesion"
        });
    }

}

async function registrarDatos(req, res) {
    try {
        await poolConnect;
        if (req.body.fec_ing === '' ||req.body.ci === '' || req.body.ci_loc === '' || req.body.select_sangre === '') {
                req.flash('msgRD', 'LLene los campos correspondientes')
                req.flash('aux', req.body.edtBuscar)
                res.redirect('/buscarBeneficiario')
        } else {
            const result = await request.query(`update beneficiarios set fec_ing = '${req.body.fec_ing}', tipo_sangre = '${req.body.select_sangre}', ci = '${req.body.ci}', ci_loc = '${req.body.ci_loc}' where cod_bnf = '${req.body.edtBuscar}'`)
            const response = result.rowsAffected[0]
    
            if (response > 0) { // 1 fila afectada = actualizacion exitosa
                req.flash('msgRD', 'Registro Exitoso')
                req.flash('aux', req.body.edtBuscar)
                res.redirect('/buscarBeneficiario')
            } else { // 0 filas afectadas = no se actualizo
                console.log(req.body)
                req.flash('msgRD', 'Error en el Registro')
                req.flash('aux', req.body.edtBuscar)
                res.redirect('/buscarBeneficiario')
            }
        }
    } catch (err) {
        console.error('SQL error', err);
        req.flash('msgRD', 'Error en el Registro')
        req.flash('aux', req.body.edtBuscar)
        res.redirect('/buscarBeneficiario')
    }
}

async function renderDatos(req, res, msg) {

    try {
        await poolConnect;
        const result = await request.query(`select * from beneficiarios where beneficiarios.cod_bnf = '${req.body.edtBuscar}'`)
        const response = result.recordset[0]
        console.log(response)
        if (response == undefined) { // no existe el codigo del asegurado
            req.flash('loginMessage', 'Beneficiario no encontrado')
            res.redirect('/buscarBeneficiario')
        }
        if (response !== undefined) { // beneficiario encontrado
            const str = response.nombre.split(" ")
            const apellido = str[0] + " " + str[1]
            let nombre = ''
            for (let index = 2; index < str.length; index++) {
                nombre = nombre + " " + str[index]
            }
            // const carnet = await request.query(`SELECT id_carnet,beneficiarios.cod_bnf,nombre, carnet.created_at,motivo,comprobante,estado FROM carnet,beneficiarios where beneficiarios.cod_bnf = '${response.cod_bnf}'
            //                                     and beneficiarios.cod_bnf = carnet.cod_bnf`)
            const carnet = await request.query(`SELECT carnet.id_carnet, beneficiarios.cod_bnf, nombre, login, carnet.created_at, motivo, comprobante, carnet.estado,
                                                fec_comp, front, back, CONVERT(VARCHAR, GETDATE(), 103) as fec_servidor
                                                FROM carnet, beneficiarios, usuarios, imp_carnet
                                                where beneficiarios.cod_bnf = '${response.cod_bnf}'
                                                and beneficiarios.cod_bnf = carnet.cod_bnf
                                                and carnet.id_usuario = usuarios.id and carnet.id_carnet = imp_carnet.id_carnet `)
            console.log(carnet.recordset)

            let file_test = `./src/photos/Beneficiarios/${req.body.edtBuscar}.jpg`
            let file_ase = ''
            fs.access(file_test,fs.constants.F_OK, (err) => {
                if (err) {
                    // console.error(err)
                file_ase = ''
                    return
                }
                //file exists
                file_ase = `../photos/Beneficiarios/${req.body.edtBuscar}.jpg`
                })
            QRCode.toDataURL(JSON.stringify(req.user), function (err, url) {
                res.render('buscarBeneficiario', {
                    message: msg,
                    menu: 'Beneficiarios',
                    subm: 'buscarBeneficiario',
                    id: req.body.edtBuscar,
                    user: req.user,
                    qr: `${url}`,
                    file: `../photos/Usuarios/${req.user.email}.jpg`,
                    file_ase: file_ase,
                    res: response,
                    apellido: apellido,
                    nombre: nombre,
                    codigo: response.cod_bnf,
                    historial: carnet.recordset
                })
            })
        }
    } catch (err) {
        console.error('SQL error', err);
        req.flash('loginMessage', 'ERROR')
        res.redirect('/buscarBeneficiario')
    }
}

module.exports = {
    obtenerBeneficiarios,
    obtenerInfoBeneficiario,
    listaBeneficiarios,
    btnListaBeneficiarios,
    agregarFotoB
}