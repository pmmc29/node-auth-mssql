const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt-nodejs')
const passport = require('passport')
const pool = require('../database')
const multer = require('multer')
const path = require('path')
const QRCode = require('qrcode')

const cuentas = require('../models/cuentas')
const asegurados = require('../models/asegurados')
const carnet = require('../models/carnet')

const poolConnect = pool.connect();


const request = pool.request(); // or: new sql.Request(pool1)

pool.on('error', err => {
    // ... error handler
    console.log(err)
});

//-------------ROUTES-------------------
router.get('/', function (req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect('/home');
    } else {
        res.render('index', {
            title: "Home",
            userData: req.user,
            messages: {
                danger: req.flash('danger'),
                warning: req.flash('warning'),
                success: req.flash('success')
            }
        });
    }
});
//-------------UPLOAD PHOTOS------------------
//Set Storage Engine
const storage = multer.diskStorage({
    destination: path.join(__dirname, '../photos'),
    filename: function (req, file, cb) {
        const user = req.body
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
router.get('/signup', function (req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect('/home');
    } else {
        res.render('signup', {
            title: "Sign Up",
            user: req.user
        });
    }
});

router.post('/signup', async function (req, res) {

    try {
        console.log('1:', req.body, req.body.password) //sin valor en el body
        await poolConnect;
        // await request.query('BEGIN')
        JSON.stringify(request.query(`SELECT id FROM usuarios WHERE login='${req.body.email}'`, function (err, result) {
            console.log('2:', req.body.email, req.body.password) //sin valor en el body
            if (result.recordset[0]) {
                console.log('warning', "This user login is already registered. <a href='/login'>Log in!</a>")
                res.redirect('/login')
            } else {
                uploadPhoto(req, res, (err) => {
                    if (err) {
                        res.render('signup', {
                            msg: err
                        })
                    } else {
                        if (req.file == undefined) {
                            res.render('signup', {
                                msg: 'No File Selected!!!'
                            })
                        } else {
                            console.log('3:', req.body.email, req.body.password)
                            var pwd = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))
                            request.query(`INSERT INTO usuarios (login, pass,tipo,created_at) VALUES ('${req.body.email}', '${pwd}','2',SYSDATETIME())`, function (err, result) {
                                if (err) {
                                    console.log('ERROR: ', err)
                                } else {
                                    // request.query('COMMIT')
                                    console.log('AQUI ', result)
                                    res.render('login', {
                                        msg: 'Usuario Creado!!!'
                                    })
                                    // res.redirect('/login');
                                    return
                                }
                            })
                            // console.log('success', 'User created.')
                        }
                    }
                })
            }
        }));
        // request.release();

    } catch (e) {
        throw (e)
    }
});

//----------------------------------------------
router.get('/login', function (req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect('/home');
    } else {
        res.render('login', {
            title: "Sign In",
            user: req.user
        });
    }

});

router.post('/login', passport.authenticate('local', {
    failureRedirect: '/login'
}), function (req, res) {
    if (req.body.remember) {
        console.log('remember')
        req.session.cookie.expires = false; // Cookie expires at end of session
    } else {
        req.session.cookie.maxAge = 60000; // Cookie expires after 60 seconds
    }

    res.redirect('/');
});
//----------------------------------------------
router.get('/logout', function (req, res) {

    console.log(req.isAuthenticated());
    req.logout();
    console.log(req.isAuthenticated());
    req.flash('success', "Logged out. See you soon!");
    res.redirect('/');
});
//----------------------------------------------

router.get('/home', async function (req, res, next) {
    if (req.isAuthenticated()) {
        QRCode.toDataURL(JSON.stringify(req.user), function (err, url) {
            // console.log(url)
            res.render('home', {
                user: req.user,
                menu: 'home',
                subm: 'home',
                qr: `${url}`,
                file: `../photos/${req.user.email}.jpg`
            });
        })
        console.log(req.user.id)
    } else {
        res.redirect('/login');
    }
});



router.get('/profile', async function (req, res, next) {
    if (req.isAuthenticated()) {

        QRCode.toDataURL(JSON.stringify(req.user), function (err, url) {
            // console.log(url)
            res.render('profile', {
                user: req.user,
                menu: 'profile',
                subm: 'profile',
                qr: `${url}`,
                file: `../photos/${req.user.email}.jpg`
            });
        })
        console.log(req.user.id)
    } else {
        res.redirect('/login');
    }
});
router.get('/listaAsegurados', asegurados.listAsegurados);

router.get('/buscarAsegurado', async function (req, res, next) {
    if (req.isAuthenticated()) {
        QRCode.toDataURL(JSON.stringify(req.user), function (err, url) {
            // console.log(url)
            res.render('buscarAsegurado', {
                user: req.user,
                menu: 'Asegurados',
                subm: 'buscarAsegurado',
                qr: `${url}`,
                file: `../photos/${req.user.email}.jpg`,
                res: '',
                apellido: '',
                nombre: '',
                historial: ''

            });
        })
        console.log(req.user.id)
    } else {
        res.redirect('/login');
    }
});

router.post('/buscarAsegurado', asegurados.obtenerInfoAsegurado)
router.post('/listaCuentas', cuentas.btnListaCuentas)
router.post('/listaAsegurados', asegurados.btnListaAsegurados)

router.get('/crear_usuario', cuentas.listaCuenta);

// router.post('/crear_usuario', asegurados.obtenerInfoAsegurado)
router.get('/carnet', async (req, res, next) => {
    console.log(req.body)
    res.render('carnet')
})



//----------------API---------------------------

router.get('/api/getUsers/:tipo?', cuentas.obtenerCuentas)
router.get('/api/getAsegurados/:codigo?', asegurados.obtenerAsegurados)
router.get('/api/getCarnet/:codigo', carnet.obtenerCarnet)


module.exports = router