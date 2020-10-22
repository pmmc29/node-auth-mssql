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
    obtenerEmpresas,
    listaEmpresas,
    btnListaEmpresas
}