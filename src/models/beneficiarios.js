const pool = require('../database');
const poolConnect = pool.connect();
const QRCode = require('qrcode')

const request = pool.request(); // or: new sql.Request(pool1)

pool.on('error', err => {
    // ... error handler
    console.log(err)
});

async function obtenerBeneficiarios(req, res) {
    const codigo = req.params.codigo
    try {
        await poolConnect;
        if (codigo !== undefined) {
            const result2 = await request.query(`select * from beneficiarios2 where cod_be = '${codigo}'`)
            res.json(result2.recordset)
        } else {
            const result = await request.query(`select * from beneficiarios2`)
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
            const result = await request.query(`select * from asegurados2
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
            title: "Sign In"
        });
    }
}

async function registrarDatos(req, res) {
    try {
        await poolConnect;
        if (req.body.ci === '' || req.body.ci_loc === undefined || req.body.select_sangre === undefined) {
                req.flash('loginMessage', 'LLene los campos correspondientes')
                req.flash('aux', req.body.edtBuscar)
                res.redirect('/buscarAsegurado')
        } else {
            const result = await request.query(`update beneficiarios2 set tipo_sangre = '${req.body.select_sangre}', ci = '${req.body.ci}', ci_loc = '${req.body.ci_loc}' where cod_be = '${req.body.edtBuscar}'`)
            const response = result.rowsAffected[0]
    
            if (response > 0) { // 1 fila afectada = actualizacion exitosa
                req.flash('loginMessage', 'Registro Exitoso')
                req.flash('aux', req.body.edtBuscar)
                res.redirect('/buscarAsegurado')
            } else { // 0 filas afectadas = no se actualizo
                console.log(req.body)
                req.flash('loginMessage', 'Error en el Registro')
                req.flash('aux', req.body.edtBuscar)
                res.redirect('/buscarAsegurado')
            }
        }
    } catch (err) {
        console.error('SQL error', err);
        req.flash('loginMessage', 'Error en el Registro')
        req.flash('aux', req.body.edtBuscar)
        res.redirect('/buscarAsegurado')
    }
}

async function renderDatos(req, res, msg) {

    try {
        await poolConnect;
        const result = await request.query(`select * from beneficiarios2 where cod_be = '${req.body.edtBuscar}'`)
        const response = result.recordset[0]
        console.log(response)
        if (response == undefined) { // no existe el codigo del asegurado
            req.flash('loginMessage', 'Beneficiario no encontrado')
            res.redirect('/buscarAsegurado')
        }
        if (response !== undefined) { // asegurado encontrado
            const str = response.name.split(" ")
            const apellido = str[0] + " " + str[1]
            let nombre = ''
            for (let index = 2; index < str.length; index++) {
                nombre = nombre + " " + str[index]
            }
            const carnet = await request.query(`SELECT id_carnet,cod_be,name,login, carnet.created_at,motivo,comprobante FROM carnet,usuarios,beneficiarios2 where cod_be = '${response.cod_be}'
                                                and cod_be = cod_beneficiario and id_usuario = usuarios.id`)
            console.log(carnet.recordset)
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
                    nombre: nombre,
                    historial: carnet.recordset
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
    obtenerBeneficiarios,
    obtenerInfoBeneficiario,
    listaBeneficiarios,
    btnListaBeneficiarios
}