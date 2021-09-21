const express = require('express')
const router = express.Router()
const passport = require('passport')
const QRCode = require('qrcode')

const cuentas = require('../models/cuentas')
const asegurados = require('../models/asegurados')
const carnet = require('../models/carnet')
const beneficiarios = require('../models/beneficiarios')
const empresas = require('../models/empresas')
const comprobante = require('../models/comprobante')
const bdatos = require('../models/bdatos')
const firmas = require('../models/firmas')


//-------------ROUTES-------------------
router.get('/', function (req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect('/CARNETIZACION/Inicio');
    } else {
        res.render('login', {
            title: "Home",
            userData: req.user
        });
    }
});

router.get('/signup', function (req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect('/CARNETIZACION/Inicio');
    } else {
        res.render('signup', {
            title: "Sign Up",
            user: req.user
        });
    }
});

router.post('/signup', cuentas.crearUsuario);

//----------------------------------------------
router.get('/CARNETIZACION/login', function (req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect('/CARNETIZACION/Inicio');
    } else {
        res.render('login', {
            user: req.user
        });
    }

});
router.get('/CARNETIZACION/update_pwd', function (req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect('/CARNETIZACION/Inicio');
    } else {
        res.render('update_pwd', {
            user: req.user
        });
    }

});

router.post('/login', passport.authenticate('local', {
    failureRedirect: '/CARNETIZACION/login'
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
router.get('/CARNETIZACION/logout', function (req, res) {

    console.log(req.isAuthenticated());
    req.logout();
    console.log(req.isAuthenticated());
    req.flash('loginMessage', "Cerró sesión con exito");
    res.redirect('/CARNETIZACION/login');
});
//----------------------------------------------

router.get('/CARNETIZACION/Manual', async function (req, res, next) {
    if (req.isAuthenticated()) {
        QRCode.toDataURL(JSON.stringify(req.user), function (err, url) {
            // console.log(url)
            res.render('iframe', {
                user: req.user,
                menu: 'Manual de Usuario',
                subm: 'manual',
                qr: `${url}`,
                file: `../photos/Usuarios/${req.user.email}.jpg`
            });
        })
        console.log(req.user.id)
    } else {
        res.redirect('/CARNETIZACION/login');
    }
});

router.get('/CARNETIZACION/Inicio', async function (req, res, next) {
    if (req.isAuthenticated()) {
        QRCode.toDataURL(JSON.stringify(req.user), function (err, url) {
            // console.log(url)
            res.render('home', {
                user: req.user,
                menu: 'home',
                subm: 'home',
                qr: `${url}`,
                file: `../photos/Usuarios/${req.user.email}.jpg`
            });
        })
        console.log(req.user.id)
    } else {
        res.redirect('/CARNETIZACION/login');
    }
});



router.get('/CARNETIZACION/Perfil', async function (req, res, next) {
    if (req.isAuthenticated()) {

        QRCode.toDataURL(JSON.stringify(req.user), function (err, url) {
            // console.log(url)
            res.render('profile', {
                user: req.user,
                menu: 'profile',
                subm: 'profile',
                qr: `${url}`,
                file: `../photos/Usuarios/${req.user.email}.jpg`
            });
        })
        console.log(req.user.id)
    } else {
        res.redirect('/CARNETIZACION/login');
    }
});
router.get('/CARNETIZACION/listaAsegurados', asegurados.listAsegurados);
router.get('/CARNETIZACION/listaEmpresas', empresas.listaEmpresas);

router.get('/CARNETIZACION/buscarAsegurado', async function (req, res, next) {
    if (req.isAuthenticated()) {
        QRCode.toDataURL(JSON.stringify(req.user), function (err, url) {
            // console.log(url)
            res.render('buscarAsegurado', {
                user: req.user,
                menu: 'Asegurados',
                subm: 'buscarAsegurado',
                qr: `${url}`,
                file: `../photos/Usuarios/${req.user.email}.jpg`,
                file_ase: '',
                res: '',
                apellido: '',
                nombre: '',
                historial: '',
                message: '',
                new_emp: ''

            });
        })
        console.log(req.user.id)
    } else {
        res.redirect('/CARNETIZACION/login');
    }
});
router.get('/CARNETIZACION/registrarAsegurado', async function (req, res, next) {
    if (req.isAuthenticated()) {
        QRCode.toDataURL(JSON.stringify(req.user), function (err, url) {
            // console.log(url)
            res.render('registrarAsegurado', {
                user: req.user,
                menu: 'Asegurados',
                subm: 'registrarAsegurado',
                qr: `${url}`,
                file: `../photos/Usuarios/${req.user.email}.jpg`,
                file_ase: '',
                res: '',
                apellido: '',
                nombre: '',
                historial: '',
                message: ''

            });
        })
        console.log(req.user.id)
    } else {
        res.redirect('/CARNETIZACION/login');
    }
});
router.get('/CARNETIZACION/registrarBeneficiario', async function (req, res, next) {
    if (req.isAuthenticated()) {
        QRCode.toDataURL(JSON.stringify(req.user), function (err, url) {
            // console.log(url)
            res.render('registrarBeneficiario', {
                user: req.user,
                menu: 'Beneficiarios',
                subm: 'registrarBeneficiario',
                qr: `${url}`,
                file: `../photos/Usuarios/${req.user.email}.jpg`,
                file_ase: '',
                res: '',
                apellido: '',
                nombre: '',
                historial: '',
                message: ''

            });
        })
        console.log(req.user.id)
    } else {
        res.redirect('/CARNETIZACION/login');
    }
});

router.get('/CARNETIZACION/buscarBeneficiario', async function (req, res, next) {
    if (req.isAuthenticated()) {
        QRCode.toDataURL(JSON.stringify(req.user), function (err, url) {
            // console.log(url)
            res.render('buscarBeneficiario', {
                user: req.user,
                menu: 'Beneficiarios',
                subm: 'buscarBeneficiario',
                qr: `${url}`,
                file: `../photos/Usuarios/${req.user.email}.jpg`,
                file_ase: '',
                res: '',
                apellido: '',
                nombre: '',
                historial: '',
                message: '',
                new_emp: ''

            });
        })
        console.log(req.user.id)
    } else {
        res.redirect('/CARNETIZACION/login');
    }
});
router.get('/CARNETIZACION/buscarEmpresa', async function (req, res, next) {
    if (req.isAuthenticated()) {
        QRCode.toDataURL(JSON.stringify(req.user), function (err, url) {
            // console.log(url)
            res.render('buscarEmpresa', {
                user: req.user,
                menu: 'Empresas',
                subm: 'buscarEmpresa',
                qr: `${url}`,
                file: `../photos/Usuarios/${req.user.email}.jpg`,
                file_ase: '',
                res: '',
                apellido: '',
                nombre: '',
                historial: ''

            });
        })
        console.log(req.user.id)
    } else {
        res.redirect('/CARNETIZACION/login');
    }
});

router.post('/buscarAsegurado', asegurados.obtenerInfoAsegurado)
router.post('/registrarAsegurado', asegurados.registrarAsegurado)
router.post('/buscarBeneficiario', beneficiarios.obtenerInfoBeneficiario)
router.post('/registrarBeneficiario', beneficiarios.registrarBeneficiario)
router.post('/buscarEmpresa', empresas.obtenerInfoEmpresa)
router.post('/agregarFotoAsegurado', asegurados.agregarFoto)
router.post('/agregarFotoBeneficiario', beneficiarios.agregarFotoB)
router.post('/listaCuentas', cuentas.btnListaCuentas)
router.post('/listaFirmas', firmas.btnListaFirmas)
router.post('/listaAsegurados', asegurados.btnListaAsegurados)
router.post('/listaEmpresas', empresas.btnListaEmpresas)
router.post('/verificarCarnetA', carnet.verificarCarnetA)
router.post('/verificarCarnetB', carnet.verificarCarnetB)
router.post('/numComprobanteA', comprobante.verificarComprobanteA)
router.post('/numComprobanteB', comprobante.verificarComprobanteB)
router.post('/actualizarImp', carnet.actualizarImp)
router.post('/fotoPerfil', cuentas.actualizarFoto)
router.post("/actualizarBD", bdatos.actualizarBD);
router.post('/crear_firma', firmas.crearFirma)
router.post('/update_pwd', cuentas.actualizarPWD)


router.get('/CARNETIZACION/crear_usuario', cuentas.listaCuenta);
router.get('/CARNETIZACION/crear_firma', firmas.listaFirmas);
router.get('/CARNETIZACION/actualizarBD', bdatos.renderView);

// router.post('/crear_usuario', asegurados.obtenerInfoAsegurado)

//----------------API---------------------------

router.get('/api/getUsers/:tipo?', cuentas.obtenerCuentas)
router.get('/api/getAsegurados/:codigo?', asegurados.obtenerAsegurados)
router.get('/api/getBeneficiarios/:codigo?', beneficiarios.obtenerBeneficiarios)
router.get('/api/getCarnet/:codigo/:tipo', carnet.obtenerCarnet)
router.get('/api/getEmpresas', empresas.obtenerEmpresas)



module.exports = router