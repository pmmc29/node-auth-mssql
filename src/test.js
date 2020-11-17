const pool = require('./database')
const csv = require('csvtojson')

const poolConnect = pool.connect();

pool.on('error', err => {
  // ... error handler
  console.log(err)
});

const csvFilePath = 'E:/Proyectos/2020/Node-Auth-mssql/src/dbfiles/new-asegurados2.txt';

(async function testInsert() {
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
            // await request.query(`insert into test_ase values(${parseInt(e.agenda)},'${e.cod_asegurado}','${e.nombre}','${e.fec_nac}','${e.sexo}','${e.ci}','${e.ci_loc}',${parseInt(e.cod_emp)},'${e.nom_emp}','${e.fec_ing}','${e.tipo_sangre}')`)
            // await request.query(`replace test_ase set agenda=${parseInt(e.agenda)},cod_asegurado='${e.cod_asegurado}',nombre='${e.nombre}',fec_nac='${e.fec_nac}',sexo='${e.sexo}',ci='${e.ci}',ci_loc='${e.ci_loc}',cod_emp=${parseInt(e.cod_emp)},nom_emp='${e.nom_emp}',fec_ing='${e.fec_ing}'`)
            // request.query(`if not exists (select 1 from test_ase where cod_asegurado = '${e.cod_asegurado}')
            //                     insert into test_ase values(${parseInt(e.agenda)},'${e.cod_asegurado}','${e.nombre}','${e.fec_nac}','${e.sexo}','${e.ci}','${e.ci_loc}',${parseInt(e.cod_emp)},'${e.nom_emp}','${e.fec_ing}','${e.tipo_sangre}')
            //                 else
            //                     update test_ase set agenda=${parseInt(e.agenda)},cod_asegurado='${e.cod_asegurado}',nombre='${e.nombre}',fec_nac='${e.fec_nac}',sexo='${e.sexo}',ci='${e.ci}',ci_loc='${e.ci_loc}',cod_emp=${parseInt(e.cod_emp)},nom_emp='${e.nom_emp}',fec_ing='${e.fec_ing}'
            //                     where cod_asegurado = '${e.cod_asegurado}'`)
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
})();