$(document).ready(function () {

    $("#button_cerrar_sesion").click(() => {
        cerrarSesion() 
    }) 
    $("#button_entrar").click(e => {
        e.preventDefault() 
        iniciarSesion() 
    }) 

}) 
const validarForm = (campos, clase) => {///Valida que los campos registrados contengan informacion y no esten vacios

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
//'api/user/login' => get succes data user:(nombre, tipo, org), 
const iniciarSesion = () => {  
    if ($("email").val()==''){
        $("#email").toggleClass('invalido')
        hotsnackbar('hserror', "Debe de llenar el campo de usuario.") 
        return
    }
    if(!/^[a-zA-Z0-9.!#$%&’*+\/=?^_`{|}~-]+@[a-zA-Z0-9]+(?:\.([a-zA-Z0-9]{2,3}))+$/.test($("#email").val())){
        $("#email").toggleClass('invalido')
        hotsnackbar('hserror', "El correo debe ser válido") 
        return
    }
    $.ajax({
        url: `./api/user/validate/${$("#email").val()}`,
        method: "GET",
        beforeSend: () => $("#load-bar").show()
    })
    .done(resolveData)
    .fail(failData)
}
const resolveData = data => {
    switch (data.status) {
        case 100:
            $("#login_form").toggleClass('max_width min_width', { duration: 500, queue: false }).animate({ opacity: 0 }, { duration: 260, queue: false }).animate({ 'margin-left': '-54px' }, { duration: 500, queue: false })
            $("#change_pass").toggleClass('max_width min_width', { duration: 500, queue: false })
            setTimeout(() => $("#change_pass").animate({ opacity: 1 }, { duration: 450, queue: false }), 50)
            break
        case 202:
            $("#login_form").toggleClass('max_width min_width', { duration: 500, queue: false }).animate({ opacity: 0 }, { duration: 260, queue: false }).animate({ 'margin-left': '-54px' }, { duration: 500, queue: false })
            $("#login_form2").toggleClass('max_width min_width', { duration: 500, queue: false })
            setTimeout(() => $("#login_form2").animate({ opacity: 1 }, { duration: 450, queue: false }), 50)
            break
        default:
            break
    }
}
const failData = response => { //si existe un error en la respuesta del ajax
    $("#load-bar").hide()
    switch (response.status) {
        case 403:
            hotsnackbar('hserror', "Usuario y/o contraseña incorrecta.")
            break
        case 401:
            hotsnackbar('hserror', "El usuario se encuentra deshabilitado")
            $("#load-bar").hide()
            break
        default:
            hotsnackbar('hserror', response.statusMessage)
    }
}

                                                 