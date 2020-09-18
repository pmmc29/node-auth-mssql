const pool = require('../database');
const poolConnect = pool.connect();


const request = pool.request(); // or: new sql.Request(pool1)

pool.on('error', err => {
    // ... error handler
    console.log(err)
});

async function obtenerAsegurados(req, res, next) {
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


async function obtenerInfoAsegurado(req, res, next) {
    if (req.body.btnBuscar != undefined) { //click en buscar
        await renderDatos(req, res, next, "")
    }
    if (req.body.btnRegistrar != undefined) { //click en registrar

    }
}

async function registrarSangre(req, res, next, msg) {
    await sql.connect(sqlConfig, (err) => {
        if (err) {
            console.log(err)
        }
        var request = new sql.Request();
        request.query(`update asegurados2 set tipo_sangre = '${req.body.tipo_sangre}' where cod = '${req.body.edtBuscar}'`, (err, result) => {
            if (err) {
                console.log(err)
            }
            const response = result.rowsAffected[0]
            if (response > 0) { // 1 fila afectada = actualizacion exitosa
                renderDatos(req, res, next, "Registro Exitoso") //cargo los datos de nuevo
            } else { // 0 filas afectadas = no se actualizo
                renderDatos(req, res, next, "") //cargo los datos de nuevo
            }
            console.log(response)
        });
    })
}

async function renderDatos(req, res, next, msg) {
    try {
        await poolConnect;
        const result = await request.query(`select * from asegurados2 where cod = '${req.body.edtBuscar}'`)
        const response = result.recordset[0]
        console.log(response)
        if (response == undefined) { // no existe el codigo del asegurado
            req.flash('loginMessage', 'Asegurado no encontrado')
            res.redirect('/home/1')
        }
        if (response !== undefined) { // asegurado encontrado
            // res.render('home', {
            //     message: msg,
            //     id: req.body.edtBuscar,
            //     nombre: response.name,
            //     apellido: response.name,
            //     empresa: 'test',
            //     fec_ing: 'test',
            //     matricula: 'test',
            //     fec_nac: 'test',
            //     tipo_sangre: response.tipo_sangre
            // })
            req.flash('tempData', JSON.stringify(response))
            res.redirect(`/home/1`)

        }
    } catch (err) {
        console.error('SQL error', err);
    }
}

module.exports = {
    obtenerAsegurados,
    obtenerInfoAsegurado
}