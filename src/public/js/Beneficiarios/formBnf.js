    const codigo = document.getElementById('search').value;

    $("#btn_add_card_B").click(function () {
        $("#historialB").append(`<div class="card blue-grey">
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
                            <input name="motivo" type="text" class="validate" value="" placeholder="Motivo" required>
                        </div>
                        <div class="input-field col s6">
                            <button class="btn waves-effect waves-light" type="submit" name="btnRegistrar"
                                id="btnRegistrar">Registrar
                                <i class="material-icons right">add_box</i>
                            </button>
                        </div>
                        <p class="col s3">
                            <label class="white-text">
                                <input name="validez" type="radio" value="MODULAR" checked />
                                <span>MODULAR</span>
                            </label>
                        </p>
                        <p class="col s3">
                            <label class="white-text">
                                <input name="validez" type="radio" />
                                <span>TRIMESTRAL</span>
                            </label>
                        </p>
                        <p class="col s3">
                            <label class="white-text">
                                <input name="validez" type="radio" />
                                <span>SEMESTRAL</span>
                            </label>
                        </p>
                        <p class="col s3">
                            <label class="white-text">
                                <input name="validez" type="radio" />
                                <span>ANUAL</span>
                            </label>
                        </p>
                    </ul>
                </form>
            </div>
        </div>`);
    });

    $('#btnAgregarFoto').click(() => {
        $('#form_bnf').attr('enctype', 'multipart/form-data');
        $('#form_bnf').attr('action', '/agregarFotoBeneficiario');
    })
    $('#photo_bnf').click(() => {
        $('#form_bnf').attr('enctype', 'multipart/form-data');
        $('#form_bnf').attr('action', '/agregarFotoBeneficiario');
    })
    $('#btnBuscar').click(() => {
        $('#form_bnf').attr('enctype', '');
        $('#form_bnf').attr('action', '/buscarBeneficiario');
    })
    $('#btnRegistrar').click(() => {
        $('#form_bnf').attr('enctype', '');
        $('#form_bnf').attr('action', '/buscarBeneficiario');
    })