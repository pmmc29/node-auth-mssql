const pool = require('../database');
const poolConnect = pool.connect();
const QRCode = require('qrcode');
const fs = require('fs')

const request = pool.request(); 

pool.on('error', err => {
    // ... error handler
    console.log(err)
});

async function obtenerAsegurados(req, res) {
    const codigo = req.params.codigo
    try {
        await poolConnect;
        if (codigo !== undefined) {
            const result2 = await request.query(`select * from asegurados where agenda = '${codigo}'`)
            res.json(result2.recordset)
        } else {
            const result = await request.query(`select * from asegurados`)
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
            const result = await request.query(`select * from asegurados
            order by nombre 
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

async function btnListaAsegurados(req, res) {
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


async function obtenerInfoAsegurado(req, res) {
    if (req.isAuthenticated()) {
        console.log(req.body)
        if (req.body.btnBuscar != undefined) { //click en buscar
            await renderDatos(req, res, "Asegurado encontrado")
        }
        if (req.body.btnRegistrar != undefined) { //click en registrar
            await registrarSangre(req, res)
            console.log(req.body)
        }
    } else {
        res.render('login', {
            title: "Iniciar Sesion"
        });
    }
}

async function registrarSangre(req, res) {
    try {
        await poolConnect;
        if (req.body.select_sangre === undefined) {
            console.log(req.body)
                req.flash('loginMessage', 'LLene los campos correspondientes')
                req.flash('aux', req.body.edtBuscar)
                res.redirect('/buscarAsegurado')
        } else {
            const result = await request.query(`update asegurados set tipo_sangre = '${req.body.select_sangre}' where agenda = '${req.body.edtBuscar}'`)
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
        }
    } catch (err) {
        console.error('SQL error', err);
    }
}

async function renderDatos(req, res, msg) {
    try {
        await poolConnect;
        const result = await request.query(`select * from asegurados where agenda = '${req.body.edtBuscar}'`)
        const response = result.recordset[0]
        console.log(response)
        if (response == undefined) { // no existe el codigo del asegurado
            req.flash('loginMessage', 'Asegurado no encontrado')
            res.redirect('/buscarAsegurado')
        }
        if (response !== undefined) { // asegurado encontrado
            const str = response.nombre.split(" ")
            const apellido = str[0] + " " + str[1]
            let nombre = ''
            for (let index = 2; index < str.length; index++) {
                nombre = nombre + " " + str[index]
            }
            const carnet = await request.query(`SELECT id_carnet,agenda,nombre,login, carnet.created_at,motivo,comprobante,estado FROM carnet,usuarios,asegurados where agenda = '${response.agenda}'
                                                and agenda = age_asegurado and id_usuario = usuarios.id`)
            console.log(carnet.recordset)

            let file_test = `./src/photos/Asegurados/${req.body.edtBuscar}.jpg`
            let file_ase = ''
            fs.access(file_test,fs.constants.F_OK, (err) => {
                if (err) {
                    // console.error(err)
                file_ase = ''
                    return
                }
                //file exists
                file_ase = `../photos/Asegurados/${req.body.edtBuscar}.jpg`
                })

            QRCode.toDataURL(JSON.stringify(req.user), function (err, url) {
                res.render('buscarAsegurado', {
                    message: msg,
                    menu: 'Asegurados',
                    subm: 'buscarAsegurado',
                    id: req.body.edtBuscar,
                    user: req.user,
                    qr: `${url}`,
                    file: `../photos/Usuarios/${req.user.email}.jpg`,
                    file_ase: file_ase,
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
    obtenerAsegurados,
    obtenerInfoAsegurado,
    listAsegurados,
    btnListaAsegurados
}