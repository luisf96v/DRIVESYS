$(document).ready(function () {

    $("#button_cerrar_sesion").click(() => {
        cerrarSesion() 
    }) 
    $("#button_entrar").click(e => {
        e.preventDefault() 
        iniciarSesion() 
    }) 
    $(".input_text").hover(e=>$(e.target).removeClass('error'))
    $(".login_form").submit(function(e) {
        e.preventDefault();
    });
    $('.loader-wraper').hide()
    $('span').click(()=>{
        $.alert({
            title: 'Información',
            content: 'Debe contactar con el su administrador para reestablecer su contraseña.',
            type: 'blue'
        })
    })
    $('a').click(e=>e.preventDefault())
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
const changePass = () => {
    if($('#contrasenac').val()==''||$('#contrasenac1').val()==''){
        $('#contrasenac1').val()!=''||$('#contrasenac1').addClass('error')
        $('#contrasenac').val()!=''||$('#contrasenac').addClass('error')
        hotsnackbar('hserror', "Debe introducir ambos campos.")
        return 
    }
    if($('#contrasenac').val()!=$('#contrasenac1').val()){
        $('#contrasenac').addClass('error')
        $('#contrasenac1').addClass('error')
        hotsnackbar('hserror', "Los campos deben coincidir.")
        return 
    }
    $("#load-bar").show()
    fetch(`./api/user/auth`,{
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            password: $('#contrasenac').val()
        }),
    }).then(async res=>{
        if(res.status==200){
            let {org, user} = await res.json()
            localStorage.setItem('org', JSON.stringify(org))
            localStorage.setItem('user', JSON.stringify(user))
            $('.loader-wraper').fadeIn(100)
            setTimeout(() => document.location.href = '../', 250)
        }
    })
    .catch(()=>{})
    
}
const iniciarSesion2 = () => {
    if($('#contrasena').val()==''){
        $('#contrasena').addClass('error')
        hotsnackbar('hserror', "Debe introducir la contraseña.")
        return 
    }
    $("#load-bar").show()
    fetch(`./api/user/auth/login`,{
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            password: $('#contrasena').val()
        }),
    }).then(async res=>{
        if(res.status==200){
            let {org, user} = await res.json()
            localStorage.setItem('org', JSON.stringify(org))
            localStorage.setItem('user', JSON.stringify(user))
            $('.loader-wraper').fadeIn(100)
            setTimeout(() => document.location.href = '../', 250)
        }
        else {
            hotsnackbar('hserror', "Contraseña incorrecta, vuelva a intentar.")
            $('#contrasena').addClass('error')
            $("#load-bar").hide()
        }
    })
    .catch(()=>{
        hotsnackbar('hserror', "Contraseña incorrecta, vuelva a intentar.")
        $('#contrasena').addClass('error')
        $("#load-bar").hide()
    })
}
const iniciarSesion = () => {  
    if ($("#email").val()==''){
        $("#email").toggleClass('error')
        hotsnackbar('hserror', "Debe de llenar el campo de usuario.") 
        return
    }
    if(!/^[a-zA-Z0-9.!#$%&’*+\/=?^_`{|}~-]+@[a-zA-Z0-9]+(?:\.([a-zA-Z0-9]{2,3}))+$/.test($("#email").val())){
        $("#email").toggleClass('error')
        hotsnackbar('hserror', "El correo debe ser válido") 
        return
    }
    $("#load-bar").show()
    fetch(`./api/user/auth`,{
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: $("#email").val()
        }),
    }).then(resolveData)
    .catch(failData)
}
const resolveData = async data => {
    response = await data.json()
    if(data.status>=400)
        return failData(data)
    if(response.passr){
        $("#login_form").toggleClass('max_width min_width', { duration: 500, queue: false }).animate({ opacity: 0 }, { duration: 260, queue: false }).animate({ 'margin-left': '-54px' }, { duration: 500, queue: false })
        $("#change_pass").toggleClass('max_width min_width', { duration: 500, queue: false })
        setTimeout(() => $("#change_pass").animate({ opacity: 1 }, { duration: 450, queue: false }), 50)
    } else{
        $("#login_form").toggleClass('max_width min_width', { duration: 500, queue: false }).animate({ opacity: 0 }, { duration: 260, queue: false }).animate({ 'margin-left': '-54px' }, { duration: 500, queue: false })
        $("#login_form2").toggleClass('max_width min_width', { duration: 500, queue: false })
        setTimeout(() => $("#login_form2").animate({ opacity: 1 }, { duration: 450, queue: false }), 50)
    }
    $("#load-bar").hide()
}
const failData = response => { //si existe un error en la respuesta del ajax
    //jsonD = await response.json()
    switch (response.status) {
        case 403:
            hotsnackbar('hserror', "Usuario y/o contraseña incorrecta.")
            break
        case 401:
            hotsnackbar('hserror', "El usuario se encuentra deshabilitado.")
            break
        case 404: 
            hotsnackbar('hserror', "El usuario ingresado no existe.")
            $("#email").addClass('error')
            break
        default:
            hotsnackbar('hserror', response)
    }
    $("#load-bar").hide()
}

                                                 