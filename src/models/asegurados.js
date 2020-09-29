const pool = require('../database');
const poolConnect = pool.connect();
const QRCode = require('qrcode')

const request = pool.request(); // or: new sql.Request(pool1)

pool.on('error', err => {
    // ... error handler
    console.log(err)
});

async function obtenerAsegurados(req, res) {
    const codigo = req.params.codigo
    try {
        await poolConnect;
        if (codigo !== undefined) {
            const result2 = await request.query(`select * from asegurados2 where cod = '${codigo}'`)
            res.json(result2.recordset)
        } else {
            const result = await request.query(`select * from asegurados2`)
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
            const result = await request.query(`select * from asegurados2`)
            // console.log(result.recordset)
            QRCode.toDataURL(JSON.stringify(req.user), function (err, url) {
                // console.log(url)
                res.render('test', {
                    user: req.user,
                    menu: 'Asegurados',
                    subm: 'menu2',
                    qr: `${url}`,
                    file: `../photos/${req.user.email}.jpg`,
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

async function test2(req, res) {
    try {
        if (req.isAuthenticated()) {
            console.log(req.body)
            res.redirect('/test')
        } else {
            res.redirect('/login');
        }
    } catch (err) {
        console.error('SQL error', err);
    }
}


async function obtenerInfoAsegurado(req, res) {
    if (req.isAuthenticated()) {
        if (req.body.btnBuscar != undefined) { //click en buscar
            await renderDatos(req, res, "Asegurado encontrado")
        }
        if (req.body.btnRegistrar != undefined) { //click en registrar
            await registrarSangre(req, res)
            console.log(req.body)
        }
    } else {
        res.render('login', {
            title: "Sign In"
        });
    }
}

async function registrarSangre(req, res) {
    try {
        await poolConnect;
        const result = await request.query(`update asegurados2 set tipo_sangre = '${req.body.select_sangre}' where cod = '${req.body.edtBuscar}'`)
        const response = result.rowsAffected[0]

        if (response > 0) { // 1 fila afectada = actualizacion exitosa
            req.flash('loginMessage', 'Registro Exitoso')
            req.flash('aux', req.body.edtBuscar)
            res.redirect('/buscarAsegurado')
        } else { // 0 filas afectadas = no se actualizo
            req.flash('loginMessage', 'Error en el Registro')
            req.flash('aux', req.body.edtBuscar)
            res.redirect('/buscarAsegurado')

        }
        console.log(response)
    } catch (err) {
        console.error('SQL error', err);
    }
}

async function renderDatos(req, res, msg) {

    try {
        await poolConnect;
        const result = await request.query(`select * from asegurados2 where cod = '${req.body.edtBuscar}'`)
        const response = result.recordset[0]
        console.log(response)
        if (response == undefined) { // no existe el codigo del asegurado
            req.flash('loginMessage', 'Asegurado no encontrado')
            res.redirect('/buscarAsegurado')
        }
        if (response !== undefined) { // asegurado encontrado
            const str = response.name.split(" ")
            const apellido = str[0] + " " + str[1]
            let nombre = ''
            for (let index = 2; index < str.length; index++) {
                nombre = nombre + " " + str[index]
            }

            QRCode.toDataURL(JSON.stringify(req.user), function (err, url) {
                res.render('buscarAsegurado', {
                    message: msg,
                    menu: 'Asegurados',
                    subm: 'buscarAsegurado',
                    id: req.body.edtBuscar,
                    user: req.user,
                    qr: `${url}`,
                    file: `../photos/${req.user.email}.jpg`,
                    res: response,
                    apellido: apellido,
                    nombre: nombre
                })
            })
        }
    } catch (err) {
        console.error('SQL error', err);
        req.flash('loginMessage', 'ERROR')
        res.redirect('/buscarAsegurado')
    }
}

module.exports = {
    obtenerAsegurados,
    obtenerInfoAsegurado,
    listAsegurados,
    test2
}