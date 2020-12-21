    const codigo = document.getElementById('search').value;
    const edad = document.getElementById('edad_bnf').value;
    const last_card = document.getElementById('last_card_bnf').value;

    $("#btn_add_card_B").click(function () {
        if (edad >= 0 && edad <= 18) {
            $("#historialB").append(`<div class="card" style="background: #008080;">
                <div class="card-content row">
                    <form action="/numComprobanteB" method="POST">
                        <ul>
                            <div class="input-field white-text">
                                <h5><b>Nuevo Carnet</b></h5>
                                <li><b>Codigo: </b> ${codigo}</li>
                                <li><b>Edad: </b> ${edad} años</li>
                                <li id="fec_item"><b>Valido por: </b>Maximo 3 Años hasta cumplir los 19</li>
                                <input name="codigo" type="text" class="validate" value="${codigo}" hidden>
                                <input name="edad" type="text" class="validate" value="${edad}" hidden>
                                <input name="tipo" type="text" class="validate" value="MENOR" hidden>
                                <input name="comprobante" type="text" class="validate" value=""
                                    placeholder="Numero de Comprobante" required>
                            </div>
                        <div class="input-field col s6">
                            <button class="btn waves-effect waves-light teal darken-4" style="border:1px solid;" type="submit" name="btnRegistrar"
                                id="btnRegistrar">Registrar
                                <i class="material-icons right">add_box</i>
                            </button>
                        </div>
                    </ul>
                </form>
            </div>
        </div>`);
        }else{
            if (edad >= 19 && edad <= 25) {
                $("#historialB").append(`<div class="card" style="background: #008080;">
            <div class="card-content white-text row">
                <h5><b>Nuevo Carnet</b></h5>
                <form action="/numComprobanteB" method="POST">
                    <ul>
                        <div class="input-field">
                            <li><b>Codigo: </b> ${codigo}</li>
                            <li><b>Edad: </b> ${edad} años</li>
                            <input name="codigo" type="text" class="validate" value="${codigo}" hidden>
                            <input name="edad" type="text" class="validate" value="${edad}" hidden>
                            <input name="tipo" type="text" class="validate" value="MAYOR" hidden>
                            <input name="comprobante" type="text" class="validate" value=""
                                placeholder="Numero de Comprobante" required>
                        </div>
                        <div class="input-field col s6">
                            <button class="btn waves-effect waves-light green darken-4" style="border:1px solid;" type="submit" name="btnRegistrar"
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
                                <input name="validez" type="radio" value="TRIMESTRAL"/>
                                <span>TRIMESTRAL</span>
                            </label>
                        </p>
                        <p class="col s3">
                            <label class="white-text">
                                <input name="validez" type="radio" value="SEMESTRAL"/>
                                <span>SEMESTRAL</span>
                            </label>
                        </p>
                        <p class="col s3">
                            <label class="white-text">
                                <input name="validez" type="radio" value="ANUAL"/>
                                <span>ANUAL</span>
                            </label>
                        </p>
                    </ul>
                </form>
            </div>
        </div>`);
        }else {// superior a 26 años
            $("#historialB").append(`<div class="card" style="background: #008080;">
                <div class="card-content white-text row">
                    <h5><b>Edad: ${edad} años</b></h5>
                </div>
            </div>`);
            }
        }
    });
    $("#btn_recov_card_B").click(function () {
            $("#historialB").append(`<div class="card grey darken-2">
                <div class="card-content row">
                    <form action="/numComprobanteB" method="POST">
                        <ul>
                            <div class="input-field white-text">
                                <h5><b>Recuperar Carnet</b></h5>
                                <li><b>Codigo: </b> ${codigo}</li>
                                <li><b>Edad: </b> ${edad} años</li>
                                <input name="codigo" type="text" class="validate" value="${codigo}" hidden>
                                <input name="edad" type="text" class="validate" value="${edad}" hidden>
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