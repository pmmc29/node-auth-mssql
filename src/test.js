const pool = require('./database')
const csv = require('csvtojson')

const poolConnect = pool.connect();

pool.on('error', err => {
  // ... error handler
  console.log(err)
});

const csvFilePath = 'E:/Proyectos/2020/Node-Auth-mssql/src/dbfiles/new-asegurados2.txt';

async function updateAsegurados() {
  await poolConnect; // ensures that the pool has been created
  try {
    const request = pool.request(); // or: new sql.Request(pool1)
    csv({
        delimiter: ["|"],
        headers: ['agenda', 'cod_asegurado', 'nombre', 'fec_nac', 'sexo', 'ci', 'ci_loc', 'cod_emp', 'nom_emp', 'fec_ing', 'tipo_sangre']
      })
      .fromFile(csvFilePath)
      .then((jsonObj) => {
        var bar = new Promise((resolve, reject) => {
          jsonObj.forEach((e, index, array) => {
            request.query(`if not exists (select 1 from asegurados where cod_asegurado = '${e.cod_asegurado}')
                                            insert into asegurados values(${parseInt(e.agenda)},'${e.cod_asegurado}','${e.nombre}','${e.fec_nac}','${e.sexo}',
                                            '${e.ci}','${e.ci_loc}',${parseInt(e.cod_emp)},'${e.nom_emp}','${e.fec_ing}','${e.tipo_sangre}')
                                        else
                                            update asegurados set agenda=${parseInt(e.agenda)},cod_asegurado='${e.cod_asegurado}',nombre='${e.nombre}',
                                            fec_nac='${e.fec_nac}',sexo='${e.sexo}',ci='${e.ci}',ci_loc='${e.ci_loc}',cod_emp=${parseInt(e.cod_emp)},
                                            nom_emp='${e.nom_emp}',fec_ing='${e.fec_ing}'
                                            where cod_asegurado = '${e.cod_asegurado}'`)
            // console.log(e)
            if (index === array.length - 1) resolve();
          });
        });

        bar.then(() => {
          console.log('All done!');
        });
      })
  } catch (err) {
    console.error('SQL error', err);
  }
}

const fileBnf = 'E:/Proyectos/2020/Node-Auth-mssql/src/dbfiles/new-beneficiarios2.txt';

async function updateBeneficiarios() {
  await poolConnect; // ensures that the pool has been created
  try {
    const request = pool.request(); // or: new sql.Request(pool1)
    csv({
        delimiter: ["|"],
        headers: ['agenda', 'cod_bnf', 'nombre', 'fec_nac', 'sexo', 'cod_par', 'cod_emp', 'nom_emp', 'tipo_sangre']
      })
      .fromFile(fileBnf)
      .then((bnfObj) => {
        var bar = new Promise((resolve, reject) => {
          bnfObj.forEach((e, index, array) => {
            request.query(`if not exists (select 1 from beneficiarios where cod_bnf = '${e.cod_bnf}')
                                            insert into beneficiarios(agenda,cod_bnf,nombre,fec_nac,sexo,cod_par,cod_emp,nom_emp,tipo_sangre) 
                                            values(${parseInt(e.agenda)},'${e.cod_bnf}','${e.nombre}','${e.fec_nac}','${e.sexo}',
                                            ${parseInt(e.cod_par)},${parseInt(e.cod_emp)},'${e.nom_emp}','${e.tipo_sangre}')
                                        else
                                            update beneficiarios set agenda=${parseInt(e.agenda)},cod_bnf='${e.cod_bnf}',nombre='${e.nombre}',
                                            fec_nac='${e.fec_nac}',sexo='${e.sexo}',cod_par=${parseInt(e.cod_par)},cod_emp=${parseInt(e.cod_emp)},
                                            nom_emp='${e.nom_emp}'
                                            where cod_bnf = '${e.cod_bnf}'`)
            // console.log(e)
            if (index === array.length - 1) resolve();
          });
        });

        bar.then(() => {
          console.log('All done!');
        });
      })
  } catch (err) {
    console.error('SQL error', err);
  }
}

// updateBeneficiarios()
// updateAsegurados()