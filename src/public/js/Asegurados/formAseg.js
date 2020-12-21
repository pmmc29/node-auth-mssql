//recuperar los datos del formulario
const codigo = document.getElementById('search').value;

var options = {
    format: 'dd/mm/yyyy',
    yearRange: [new Date().getFullYear(), (new Date().getFullYear()) + 20],
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
                <div class="card-content row">
                    <form action="/numComprobanteA" method="POST">
                        <ul>
                            <div class="input-field white-text">
                                <h5><b>Nuevo Carnet</b></h5>
                                <li><b>Codigo: </b> ${codigo}</li>
                                <input name="codigo" type="text" class="validate" value="${codigo}" hidden>
                                <input name="comprobante" type="text" class="validate" value=""
                                    placeholder="Numero de Comprobante" required>
                                <li id="fec_item" hidden><b>Valido por: </b> 3 Años</li>
                            </div>
                            <div class="input-field" id="fec_contrato">
                                <input id="contrato" name="fec_contrato" type="text" class="fec_contrato">
                                <label for="contrato"> Fecha de Contrato </label>
                            </div>
                            <div class="input-field col s6">
                                <button class="btn waves-effect waves-light" type="submit" name="btnRegistrar"
                                    id="btnRegistrar">Registrar
                                    <i class="material-icons right">add_box</i>
                                </button>
                            </div>
                            <div class="col s6">
                                <p>
                                    <label class="white-text">
                                        <input name="validez" type="radio" value="CONTRATO" checked/>
                                        <span>CONTRATO</span>
                                    </label>
                                </p>
                                <p>
                                    <label class="white-text">
                                        <input name="validez" type="radio" value="ITEM"/>
                                        <span>ITEM</span>
                                    </label>
                                </p>
                            </div>
                        </ul>
                    </form>
                </div>
            </div>`);
    $('input[name="validez"]').change(() => {
        // console.log($('input[name="validez"]:checked').val())
        if ($('input[name="validez"]:checked').val() == 'ITEM') {
            console.log('item')
            $('#fec_contrato').attr('hidden', 'true');
            $('#fec_item').removeAttr('hidden');
        }
        if ($('input[name="validez"]:checked').val() == 'CONTRATO') {
            console.log('contrato')
            $('#fec_item').attr('hidden', 'true');
            $('#fec_contrato').removeAttr('hidden');
        }
    });
    M.Datepicker.init(document.querySelectorAll('.fec_contrato'), options);

});

$("#btn_recov_card_A").click(function () {
    $("#historialA").append(`<div class="card grey darken-2">
                <div class="card-content row">
                    <form action="/numComprobanteA" method="POST">
                        <ul>
                            <div class="input-field white-text">
                                <h5><b>Recuperar Carnet</b></h5>
                                <h6>(Ultimo carnet registrado)</h6>
                                <li><b>Codigo: </b> ${codigo}</li>
                                <input name="codigo" type="text" class="validate" value="${codigo}" hidden>
                                <input name="tipo" type="text" class="validate" value="RECUPERADO" hidden>
                                <input name="comprobante" type="text" class="validate" value=""
                                    placeholder="Numero de Comprobante" required>
                            </div>
                        <div class="input-field col s6">
                            <button class="btn waves-effect waves-light grey darken-4" style="border:1px solid;" type="submit" name="btnRegistrar"
                                id="btnRegistrar">Registrar
                                <i class="material-icons right">add_box</i>
                            </button>
                        </div>
                    </ul>
                </form>
            </div>
        </div>`);
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
