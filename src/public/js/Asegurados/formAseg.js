//recuperar los datos del formulario
const codigo = document.getElementById('search').value;

var options = {
    format: 'dd/mm/yyyy',
    yearRange: [1950, new Date().getFullYear()],
    i18n: {
        months: [
            'Enero',
            'Febrero',
            'Marzo',
            'Abril',
            'Mayo',
            'Junio',
            'Julio',
            'Agosto',
            'Septiembre',
            'Octubre',
            'Noviembre',
            'Diciembre'
        ],
        monthsShort: [
            'Ene',
            'Feb',
            'Mar',
            'Abr',
            'May',
            'Jun',
            'Jul',
            'Ago',
            'Sep',
            'Oct',
            'Nov',
            'Dic'
        ],
        weekdays: [
            'Domingo',
            'Lunes',
            'Martes',
            'Miercoles',
            'Jueves',
            'Viernes',
            'Sabado'
        ],
        weekdaysShort: [
            'Dom',
            'Lun',
            'Mar',
            'Mie',
            'Jue',
            'Vie',
            'Sab'
        ],
        weekdaysAbbrev: ['D', 'L', 'M', 'M', 'J', 'V', 'S']
    }
}


$("#btn_add_card_A").click(function () {
    $("#historialA").append(`<div class="card blue-grey">
                <div class="card-content white-text row">
                    <h5><b>Nuevo Carnet</b></h5>
                    <form action="/numComprobanteA" method="POST">
                        <ul>
                            <div class="input-field">
                                <li><b>Codigo: </b> ${codigo}</li>
                                <input name="codigo" type="text" class="validate" value="${codigo}" hidden>
                                <input name="tipo" type="text" class="validate" value="1" hidden>
                                <input name="comprobante" type="text" class="validate" value=""
                                    placeholder="Numero de Comprobante" required>
                                <input name="motivo" type="text" class="validate" value="" placeholder="Motivo"
                                    required>
                                <div class="input-field col s6 black-text">
                                    <input id="fec_contrato" name="fec_contrato" type="text" class="fec_contrato"
                                        value="">
                                    <label for="fec_contrato">Fecha Fin de Contrato</label>
                                </div>
                            </div>
                            <div class="input-field col s6">
                                <button class="btn waves-effect waves-light" type="submit" name="btnRegistrar"
                                    id="btnRegistrar">Registrar
                                    <i class="material-icons right">add_box</i>
                                </button>
                            </div>
                            <p class="col s3">
                                <label class="white-text">
                                    <input name="validez" type="radio" value="CONTRATO" />
                                    <span>CONTRATO</span>
                                </label>
                            </p>
                            <p class="col s3">
                                <label class="white-text">
                                    <input name="validez" type="radio" value="ITEM"/>
                                    <span>ITEM</span>
                                </label>
                            </p>
                        </ul>
                    </form>
                </div>
            </div>`);
    $('input[name="validez"]').change(() => {
        console.log($('input[name="validez"]:checked').val())
    });
    M.Datepicker.init(document.querySelectorAll('.fec_contrato'), options);

});

$('#btnAgregarFoto').click(() => {
    $('#form_aseg').attr('enctype', 'multipart/form-data');
    $('#form_aseg').attr('action', '/agregarFotoAsegurado');
})
$('#photo_aseg').click(() => {
    $('#form_aseg').attr('enctype', 'multipart/form-data');
    $('#form_aseg').attr('action', '/agregarFotoAsegurado');
})
$('#btnBuscar').click(() => {
    $('#form_aseg').attr('enctype', '');
    $('#form_aseg').attr('action', '/buscarAsegurado');
})
$('#btnRegistrar').click(() => {
    $('#form_aseg').attr('enctype', '');
    $('#form_aseg').attr('action', '/buscarAsegurado');
})
// $('#btnAgregarFoto').click(() => {
//     $('#form1').attr('enctype', 'multipart/form-data');
//     if ($('#tipo_asegurado').val() == '1') {
//         $('#form1').attr('action', '/agregarFotoAsegurado');
//     }
//     if ($('#tipo_asegurado').val() == '2') {
//         $('#form1').attr('action', '/agregarFotoBeneficiario');
//     }
// })
// $('#myPhoto').click(() => {
//     $('#form1').attr('enctype', 'multipart/form-data');
//     $('#form1').attr('action', '/agregarFotoAsegurado');

// })
// $('#btnBuscar').click(() => {
//     $('#form1').attr('enctype', '');
//     if ($('#tipo_asegurado').val() == '1') {
//         $('#btnBuscar').prop('disabled', false);
//         $('#btnRegistrar').prop('disabled', false);
//         $('#btnAgregarFoto').prop('disabled', false);
//         $('#myPhoto').prop('disabled', false);
//         $('#form1').attr('action', '/buscarAsegurado');
//         $('#form_foto').attr('action', '/buscarAsegurado');
//     }
//     if ($('#tipo_asegurado').val() == '2') {
//         $('#form1').attr('action', '/buscarBeneficiario');
//         $('#form_foto').attr('action', '/buscarBeneficiario');
//         $('#btnBuscar').prop('disabled', false);
//         $('#btnRegistrar').prop('disabled', false);
//         $('#btnAgregarFoto').prop('disabled', false);
//         $('#myPhoto').prop('disabled', false);

//     }
// })

// $("#tipo_asegurado").change(function () {
//     if ($('#tipo_asegurado').val() == '1') {
//         $('#btnBuscar').prop('disabled', false);
//         $('#btnRegistrar').prop('disabled', false);
//         $('#btnAgregarFoto').prop('disabled', false);
//         $('#myPhoto').prop('disabled', false);
//         $('#form1').attr('action', '/buscarAsegurado');
//         $('#form_foto').attr('action', '/buscarAsegurado');
//     }
//     if ($('#tipo_asegurado').val() == '2') {
//         $('#form1').attr('action', '/buscarBeneficiario');
//         $('#form_foto').attr('action', '/buscarBeneficiario');
//         $('#btnBuscar').prop('disabled', false);
//         $('#btnRegistrar').prop('disabled', false);
//         $('#btnAgregarFoto').prop('disabled', false);
//         $('#myPhoto').prop('disabled', false);

//     }
// });