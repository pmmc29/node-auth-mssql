const pool = require('../database');
const poolConnect = pool.connect();
const QRCode = require('qrcode')



const request = pool.request(); // or: new sql.Request(pool1)

pool.on('error', err => {
    // ... error handler
    console.log(err)
});

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
        if (req.isAuthenticated()) {
            await poolConnect;
            const result = await request.query(`SELECT * FROM usuarios`)
            let cuentas = []

            for (let index = 0; index < result.recordset.length; index++) {
                const photo = `../photos/${result.recordset[index].login}.jpg`
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
                    file: `../photos/${req.user.email}.jpg`,
                    cuentas: cuentas
                });
            })
            console.log(req.user.id)
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

async function datosCuenta(req, res, next) {
    await QRCode.toDataURL(JSON.stringify(req.user), function (err, url) {
        let cuenta = {
            user: req.user,
            menu: 'buscarAsegurado',
            qr: `${url}`,
            file: `../photos/${req.user.email}.jpg`
        }
        return cuenta;
    })

}



module.exports = {
    obtenerCuentas,
    datosCuenta,
    listaCuenta,
    btnListaCuentas
}