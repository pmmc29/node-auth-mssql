const pool = require('../database');
const poolConnect = pool.connect();
const QRCode = require('qrcode')
const bcrypt = require('bcrypt-nodejs')
const multer = require('multer')
const path = require('path');

const request = pool.request(); // or: new sql.Request(pool1)

pool.on('error', err => {
    // ... error handler
    console.log(err)
});

//-------------UPLOAD PHOTOS------------------
//Set Storage Engine
const storage = multer.diskStorage({
    destination: path.join(__dirname, '../photos/Usuarios'),
    filename: function (req, file, cb) {
        const user = req.user
        // console.log(user.email)
        cb(null, user.email + '.jpg') //nombre de las fotos
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
}).single('myPhoto')

function checkFileType(file, cb) {
    //extenciones permitidas
    const filetypes = /jpeg|jpg|png|gif/
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
    //check mime type
    const mimetype = filetypes.test(file.mimetype)

    if (mimetype && extname) {
        return cb(null, true)
    } else {
        cb('Error: Images Only!')
    }
}
//----------------------------------------------

async function obtenerCuentas(req, res, next) {
    const tipo = req.params.tipo
    try {
        await poolConnect;
        if (tipo !== undefined) {
            const result = await request.query(`SELECT * FROM usuarios where tipo = '${tipo}'`)
            res.json(result.recordset)
        } else {
            const result2 = await request.query(`SELECT * FROM usuarios`)
            res.json(result2.recordset)
        }
    } catch (err) {
        console.error('SQL error', err);
    }
}
async function listaCuenta(req, res, next) {
    try {
        if (req.isAuthenticated() && req.user.tipo == '1') {
            await poolConnect;
            const result = await request.query(`SELECT * FROM usuarios`)
            let cuentas = []

            for (let index = 0; index < result.recordset.length; index++) {
                const photo = `../photos/Usuarios/${result.recordset[index].login}.jpg`
                cuentas.push({
                    id: result.recordset[index].id,
                    login: result.recordset[index].login,
                    pass: result.recordset[index].pass,
                    tipo: result.recordset[index].tipo,
                    created_at: result.recordset[index].created_at,
                    modified_at: result.recordset[index].modified_at,
                    photo: photo
                })
            }
            QRCode.toDataURL(JSON.stringify(req.user), function (err, url) {
                // console.log(url)
                res.render('crear_usuario', {
                    user: req.user,
                    menu: 'Usuarios',
                    subm: 'crear_usuario',
                    qr: `${url}`,
                    file: `../photos/Usuarios/${req.user.email}.jpg`,
                    cuentas: cuentas
                });
            })
            console.log(req.user.id, req.user)
            console.log(cuentas)
        } else {
            res.redirect('/login');
        }
    } catch (err) {
        console.error('SQL error', err);

    }
}
async function btnListaCuentas(req, res) {
    try {
        if (req.isAuthenticated()) {
            console.log(req.body)
            req.flash('aux', `Accion para el usuario ${req.body.id_cuenta}`)
            res.redirect('/crear_usuario')
        } else {
            res.redirect('/login');
        }
    } catch (err) {
        console.error('SQL error', err);

    }
}
async function actualizarFoto(req, res) {
    try {
        if (req.isAuthenticated()) {
            uploadPhoto(req,res, (error) => {
                if (error) {
                    req.flash('aux', error)
                    res.redirect('/profile')
                }else{
                    if (req.file == undefined) {
                        req.flash('aux', `Seleccione una Foto!`)
                        res.redirect('/profile')
                    }else{
                        req.flash('aux', `Foto Actualizada.`)
                        res.redirect('/profile')
                    }
                }

            })
        } else {
            res.redirect('/login');
        }
    } catch (err) {
        console.error(err);
    }
}

async function crearUsuario(req, res) {
    try {
        if (req.isAuthenticated() && req.user.tipo == '1') {
            await poolConnect;
            console.log(req.body)
            const usuario = await request.query(`select id from usuarios where login = '${req.body.login}'`)
            console.log(usuario.recordset[0])
            if (usuario.recordset[0]) { //Usuario ya existe
                req.flash('aux', `Este usuario ya existe`)
                res.redirect('/crear_usuario')
            } else {
                var enc_pass = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))
                const new_user = await request.query(`insert into usuarios (login,pass,tipo,created_at) values('${req.body.login}','${enc_pass}','2',CONVERT(VARCHAR,GETDATE(), 103))`)
                if (new_user.rowsAffected[0] === 1) {
                    req.flash('aux', `Usuario creado correctamente`)
                    res.redirect('/crear_usuario')
                }else{
                    req.flash('aux', `Error al crear el usuario`)
                    res.redirect('/crear_usuario')
                }
            }
        } else {
            res.redirect('/login');
        }
    } catch (e) {
        throw (e)
    }
}




async function datosCuenta(req, res, next) {
    await QRCode.toDataURL(JSON.stringify(req.user), function (err, url) {
        let cuenta = {
            user: req.user,
            menu: 'buscarAsegurado',
            qr: `${url}`,
            file: `../photos/Usuarios/${req.user.email}.jpg`
        }
        return cuenta;
    })

}



module.exports = {
    obtenerCuentas,
    datosCuenta,
    listaCuenta,
    btnListaCuentas,
    actualizarFoto,
    crearUsuario
}