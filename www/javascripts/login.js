$(document).ready(function () {

    $("#button_cerrar_sesion").click(function () {
        cerrarSesion() 
    }) 
    $("#button_entrar").click(function (e) {
        e.preventDefault() 
        iniciarSesion() 
    }) 

}) 
function validarForm(campos, clase) {///Valida que los campos registrados contengan informacion y no esten vacios

    //El parametro campos recibe un objeto properties de javascript con los campos a validar
    //esos objetos tienen que estar formato jQuery llamados con la funcion: $() de jquery

    //El parametro clase es la clase de css que se le aplicara a los objetos si no cumplen con la condicion
    // de ser requeridos
    let error = false 
    for (var prop in campos) {
        if (campos[prop].is("select")) {
            if (campos[prop].val() === "SELECCIONAR") {
                error = true 
                campos[prop].toggleClass(clase, true) 
            } else {
                campos[prop].toggleClass(clase, false) 
            }
        } else {
            if (campos[prop].val() === "") {
                error = true 
                campos[prop].toggleClass(clase, true) 
            } else {
                campos[prop].toggleClass(clase, false) 
            }
        }
    }
    return error //retorna true si existen errores, sino entonces false
}

function iniciarSesion() {
    let campos = {
        nombre: $("#usuario"),
        contrasena: $("#contrasena")
    } 
    if (!validarForm(campos, "invalido")) {
        $.ajax({
            url: './api/user/login',
            method: "POST",
            beforeSend: () => $("#load-bar").show(),
            data: {
                email: $("#usuario").val(),
                password: $("#contrasena").val()
            }
        }).done( data => { //si todo esta correcto en la respuesta del ajax, la respuesta queda en el data
                if (data === "deshabilitado") {
                    hotsnackbar('hserror', "El usuario se encuentra deshabilitado") 
                    $("#load-bar").hide() 
                } else if (data.substring(0, 2) === "E~") {
                    $("#load-bar").hide() 
                    hotsnackbar('hserror', "Usuario o contraseña incorrecto") 
                } else
                    document.location = "/"
            }

        ).fail( (response) => { //si existe un error en la respuesta del ajax
                $("#load-bar").hide() 
                switch(response.status){
                    case 403:
                        hotsnackbar('hserror', "Usuario y/o contraseña incorrecta.")
                        break
                    default:
                        hotsnackbar('hserror', "Parece que el servidor no responde")
                }
            }
        )
    } else {
        hotsnackbar('hserror', "Debe de llenar los campos de inicio de sesión") 
    }
}
function cerrarSesion() {
    $.ajax({
        url: '../LoginServlet',
        data: {
            accion: "cerrarSesion"
        },
        error: function () { //si existe un error en la respuesta del ajax
            hotsnackbar('hserror', "Parece que el servidor no responde") 
        },
        success: function () { //si todo esta correcto en la respuesta del ajax, la respuesta queda en el data
            localStorage.clear() 
            document.location = "/SIDOC/seccion/login" 
        },
        type: 'POST',
        dataType: "text"
    }) 
}
