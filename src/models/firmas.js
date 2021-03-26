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
    destination: path.join(__dirname, '../photos/Firmas'),
    filename: function (req, file, cb) {
        const firma = req.body.nombre_firma
        // console.log(user.email)
        cb(null, firma + '.jpg') //nombre de las fotos
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
}).single('myFirma')

function checkFileType(file, cb) {
    //extenciones permitidas
    const filetypes = /jpeg|jpg|png|gif/
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
    //check mime type
    const mimetype = filetypes.test(file.mimetype)

    if (mimetype && extname) {
        return cb(null, true)
    } else {
        cb('Error: Solo se permiten imagenes!')
    }
}
//----------------------------------------------

async function obtenerFirmas(req, res, next) {
    const estado = req.params.estado
    try {
        await poolConnect;
        if (estado !== undefined) {
            const result = await request.query(`SELECT * FROM firma where estado = '${estado}'`)
            res.json(result.recordset)
        } else {
            const result2 = await request.query(`SELECT * FROM firma`)
            res.json(result2.recordset)
        }
    } catch (err) {
        console.error('SQL error', err);
    }
}
async function listaFirmas(req, res, next) {
    try {
        if (req.isAuthenticated() && req.user.tipo == '1') {
            await poolConnect;
            const result = await request.query(`SELECT * FROM firma`)
            let firmas = []

            for (let index = 0; index < result.recordset.length; index++) {
                const photo = `../photos/Firmas/${result.recordset[index].nombre}.jpg`
                firmas.push({
                    id_firma: result.recordset[index].id_firma,
                    nombre: result.recordset[index].nombre,
                    created_at: result.recordset[index].created_at,
                    estado: result.recordset[index].estado,
                    photo: photo
                })
            }
            QRCode.toDataURL(JSON.stringify(req.user), function (err, url) {
                // console.log(url)
                res.render('crear_firma', {
                    user: req.user,
                    menu: 'Firmas',
                    subm: 'crear_firma',
                    qr: `${url}`,
                    file: `../photos/Usuarios/${req.user.email}.jpg`,
                    firmas: firmas
                });
            })
            console.log(req.user.id, req.user)
            console.log(firmas)
        } else {
            res.redirect('/CARNETIZACION/login');
        }
    } catch (err) {
        console.error('SQL error', err);

    }
}
async function btnListaFirmas(req, res) {
    try {
        if (req.isAuthenticated()) {
            if (req.body.id_firma) { //clic en boton ESTADO de cuenta   (0 = inactivo   1 = activo)
                const estado = await request.query(`select * from firma where id_firma = ${req.body.id_firma}`)
                if (estado.recordset[0].estado == '1') {
                    await request.query(`update firma set estado = '0' where id_firma = ${req.body.id_firma}`)
                }
                if (estado.recordset[0].estado == '0') {
                    await request.query(`update firma set estado = '1' where id_firma = ${req.body.id_firma}`)
                    await request.query(`update firma set estado = '0' where id_firma != ${req.body.id_firma}`)
                }
                res.redirect('/CARNETIZACION/crear_firma')
            }
        } else {
            res.redirect('/CARNETIZACION/login');
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
            res.redirect('/CARNETIZACION/login');
        }
    } catch (err) {
        console.error(err);
    }
}

async function crearFirma(req, res) {
    try {
        if (req.isAuthenticated() && req.user.tipo == '1') {
            await poolConnect;
            uploadPhoto(req,res, async() =>{
                const firma = await request.query(`select id_firma from firma where nombre = '${req.body.nombre_firma}'`)
                console.log(firma.recordset[0])
                if (firma.recordset[0]) { //Firma ya existe
                    req.flash('aux', `Esta firma ya existe`)
                    res.redirect('/CARNETIZACION/crear_firma')
                } else {
                    const new_firma = await request.query(`insert into firma (nombre,created_at,estado,ruta) values('${req.body.nombre_firma}',CONVERT(VARCHAR,GETDATE(), 103),'1','${req.body.nombre_firma}.jpg')`)
                    if (new_firma.rowsAffected[0] === 1) {
                        req.flash('aux', `Firma registrada correctamente`)
                        res.redirect('/CARNETIZACION/crear_firma')
                    }else{
                        req.flash('aux', `Error al registrar la firma`)
                        res.redirect('/CARNETIZACION/crear_firma')
                    }
                }
            })
        } else {
            res.redirect('/CARNETIZACION/login');
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
    obtenerFirmas,
    datosCuenta,
    listaFirmas,
    btnListaFirmas,
    actualizarFoto,
    crearFirma
}