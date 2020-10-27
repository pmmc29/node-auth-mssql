const pool = require('../database');
const poolConnect = pool.connect();
const QRCode = require('qrcode')

const request = pool.request(); // or: new sql.Request(pool1)

pool.on('error', err => {
    // ... error handler
    console.log(err)
});

async function obtenerEmpresas(req, res, next) {
    const tipo = req.params.tipo
    try {
        await poolConnect;
        if (tipo !== undefined) {
            const result = await request.query(`SELECT * FROM usuarios where tipo = '${tipo}'`)
            res.json(result.recordset)
        } else {
            const result2 = await request.query(`SELECT * FROM empresas`)
            res.json(result2.recordset)
        }
    } catch (err) {
        console.error('SQL error', err);
    }
}
async function listaEmpresas(req, res) {
    try {
        if (req.isAuthenticated()) {

            await poolConnect;
            const result = await request.query(`select * from empresas
            order by id_emp`)
            // console.log(result.recordset)
            QRCode.toDataURL(JSON.stringify(req.user), function (err, url) {
                // console.log(url)
                res.render('listaEmpresas', {
                    user: req.user,
                    menu: 'Empresas',
                    subm: 'listaEmpresas',
                    qr: `${url}`,
                    file: `../photos/Usuarios/${req.user.email}.jpg`,
                    res: '',
                    apellido: '',
                    nombre: '',
                    empresas: result.recordset
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

async function btnListaEmpresas(req, res) {
    try {
        if (req.isAuthenticated()) {
            console.log(req.body)
            req.flash('aux', `Accion para la empresa: ${req.body.id_emp}`)
            res.redirect('/listaEmpresas')
        } else {
            res.redirect('/login');
        }
    } catch (err) {
        console.error('SQL error', err);
    }
}

async function obtenerInfoEmpresa(req, res) {
    if (req.isAuthenticated()) {
        if (req.body.btnBuscar != undefined) { //click en buscar
            await renderDatos(req, res, "Empresa encontrada")
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


async function registrarDatos(req, res) {
    try {
        await poolConnect;
        if (req.body.ci === '' || req.body.validez === '') {
                req.flash('msgRD', 'LLene los campos correspondientes')
                req.flash('aux', req.body.edtBuscar)
                res.redirect('/buscarEmpresa')
        } else {
            const result = await request.query(`update empresas set validez = '${req.body.validez}', programa = '${req.body.programa}' where id_emp = ${req.body.edtBuscar}`)
            const response = result.rowsAffected[0]
    
            if (response > 0) { // 1 fila afectada = actualizacion exitosa
                req.flash('msgRD', 'Registro Exitoso')
                req.flash('aux', req.body.edtBuscar)
                res.redirect('/buscarEmpresa')
            } else { // 0 filas afectadas = no se actualizo
                console.log(req.body)
                req.flash('msgRD', 'Error en el Registro')
                req.flash('aux', req.body.edtBuscar)
                res.redirect('/buscarEmpresa')
            }
        }
    } catch (err) {
        console.error('SQL error', err);
        req.flash('msgRD', 'Error en el Registro')
        req.flash('aux', req.body.edtBuscar)
        res.redirect('/buscarEmpresa')
    }
}

async function renderDatos(req, res, msg) {

    try {
        await poolConnect;
        const result = await request.query(`select * from empresas where id_emp = ${req.body.edtBuscar}`)
        const response = result.recordset[0]
        console.log(response)
        if (response == undefined) { // no existe el codigo de la empresa
            req.flash('loginMessage', 'Empresa no encontrada')
            res.redirect('/buscarEmpresa')
        }
        if (response !== undefined) { // empresa encontrada
            QRCode.toDataURL(JSON.stringify(req.user), function (err, url) {
                res.render('buscarEmpresa', {
                    message: msg,
                    menu: 'Empresas',
                    subm: 'buscarEmpresa',
                    id: req.body.edtBuscar,
                    user: req.user,
                    qr: `${url}`,
                    file: `../photos/Usuarios/${req.user.email}.jpg`,
                    res: response,
                    codigo: response.id_emp
                })
            })
        }
    } catch (err) {
        console.error('SQL error', err);
        req.flash('loginMessage', 'ERROR')
        res.redirect('/buscarEmpresa')
    }
}



module.exports = {
    obtenerEmpresas,
    listaEmpresas,
    btnListaEmpresas,
    obtenerInfoEmpresa
}