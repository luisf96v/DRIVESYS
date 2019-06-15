
$(document).ready(function () {

    $("#limpiar").click(function () {
        limpiarForm();
    });
    $("#enviar").click(function () {
        enviar(true);
    });
    $("#actualizar").click(function () {
        enviar(false);
    });
});
function validarLetras(e) {
    var tecla = (document.all) ? e.keyCode : e.which;
    if (tecla == 8) return true;
    var patron =/^([^0-9]*)$/;
    var te = String.fromCharCode(tecla);
    return patron.test(te);
}

let user = {};
let tipo = false;
//------------------------------------------------------------------------------
//metodo que consulta todos los roles disponibles

//------------------------------------------------------------------------------

//------------------------------------------------------------------------------

//------------------------------------------------------agregar un nuevo usuario
const enviar = () => {
    if(validar())
        $.ajax({
            type: 'POST',
            url: './api/user',
            data: {
                name: $("#nombre").val(),
                email: $("#correo").val()
            }
        }).done(response => {
            if(response.status == 200){
                hotsnackbar('hsdone', "El usuario ha sido agregado.")
                limpiarForm();}
        }).fail((response) => {
            switch(response.status){
                case 400:
                    $("#correo").addClass('error')
                    hotsnackbar('hserror', "el correo ya se encuentra registrado, contacte a soporte.")
                    break
                default:
                    hotsnackbar('hserror', "Parece que el servidor no responde")
            }
        })
    else
        hotsnackbar('hserror', errorText)
}

var errorText;
function validar(type = true) {
    if (!type && user.cedula)
        if (checkUserChange({
            name: $("#nombre").val(),
            email: $("#correo").val(),
            password: $("#pass").val()
        })) {
            tipo = true;
            return false;
        }
    var correcto = true;
    $("#nombre").removeClass("error");
    $("#correo").removeClass("error");
    $("#pass").removeClass("error")

    if ($("#nombre").val() === "" || $("#nombre").val().length > 50) {
        $("#nombre").addClass("error");
        correcto = false;
    }
    if ($("#correo").val() === "" || $("#correo").val().length > 50) {
        $("#correo").addClass("error");
        correcto = false;
    }

    if ($("#pass").val() === "" || $("#pass").val().length > 50) {
        $("#pass").addClass("error");
        correcto = false;
    }

    if (!validarCorreo($("#correo").val()) || $("#correo").val().length > 50) {
        $("#correo").addClass("error");
        correcto = false;
        errorText = "debe introducir un correo valido"
    }

    return correcto;
}

function checkUserChange(u) {
    return ( u.nombre == user.nombre && u.correo == user.correo && u.pass == user.pass)
}

function limpiarForm() {
    document.getElementById("form_usuario").reset();
    $("#pass").removeClass("error")
    $("#nombre").removeClass("error");
    $("#correo").removeClass("error");
}

const validarCorreo = val => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(val)