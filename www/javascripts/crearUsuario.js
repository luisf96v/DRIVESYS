$(document).ready(function () {
    user = JSON.parse(localStorage.getItem('user'))
    user&&$('#usrName').html(`Modificacion de usuario | <b>${user.name}</b>`);
    
    $("#enviar").click(enviar);
    $("#enviarPass").click(updatePass);
    $("#nombre").hover(_=>$("#nombre").removeClass('error'))
    $("#correo").hover(_=>$("#correo").removeClass('error'))
    $('#passNew').hover(_=>$('#passNew').removeClass('error'))
    $('#passNewR').hover(_=>$('#passNewR').removeClass('error'))
    $('#passOld').hover(_=>$('#passOld').removeClass('error'))
    fetch('/creUsrNav', {
        method: 'GET'
    }).then(async e => {
        nav = await e.text()
        $("#side").html(nav)
        type = JSON.parse(localStorage.getItem('user')).type
        /*if(type==1||type==2)
            $('#tipo').html(`${$('#tipo').html()}<option value="4" active>Trabajador</option>`)*///preguntar a pablo
    });
    $.ajax({
        type: 'GET',
        url: '/api/user/info'
    }).done(response => {
        console.log(response)
        if (response.name) {
            user = response
            $("#nombre").val(user.name)
            $("#correo").val(user.email)
            $('.loader-wraper').fadeOut()
        }
    }).fail(_ => window.logation = 'http://localhost:3000/forbiden.html')
    $(".filter-button").click(function () {
        var value = $(this).attr('data-filter');

        if (value == "all") {
            //$('.filter').removeClass('hidden');
            $('.filter').show('1000');
        }
        else {
            //            $('.filter[filter-item="'+value+'"]').removeClass('hidden');
            //            $(".filter").not('.filter[filter-item="'+value+'"]').addClass('hidden');
            $(".filter").not('.' + value).hide('1900');
            $('.filter').filter('.' + value).show('2000');
        }
        $('.button-left').click(function () {
            $('.sidebar').toggleClass('fliph');
        });

    });

    $("#menu-icon").click(function (e) {
        e.stopPropagation();
        $("#chang-menu-icon").toggleClass("fa-bars").toggleClass("fa-times");
        if (!$('#mnvar').hasClass('collapsed')) { $("#show-nav").css('margin-top', '50px') }
        else { $("#show-nav").css('margin-top', '0px') }
        $("#show-nav").toggleClass("hide-sidebar").toggleClass("left-sidebar");

        //$("#left-container").toggleClass("less-width");
        //$("#right-container").toggleClass("full-width");
    });
    $('body').click(e => {
        element = $("#show-nav")[0]
        if (element != e.target && !element.contains(e.target) && $("#show-nav").hasClass("left-sidebar")) {
            $("#chang-menu-icon").toggleClass("fa-bars").toggleClass("fa-times");
            $("#show-nav").toggleClass("hide-sidebar").toggleClass("left-sidebar");
        }
    })

    if ($(".filter-button").removeClass("active")) {
        $(this).removeClass("active");
    }

});
const logout = () => {
    fetch(`./api/user/auth/logout`, {
        method: 'GET',
        credentials: "include"
    }).then(() => {
        localStorage.removeItem('org')
        localStorage.removeItem('user')
        setTimeout(() => window.location.reload(), 1)
    })
}
const goToDump = () => {
    $('.loader-wraper').fadeIn(100)
    setTimeout(() => document.location.href = '/dumpRoot', 250)
}
const goToStart = () => {
    $('#profileLink').fadeIn(100)
    $('.loader-wraper').fadeIn(100)
    setTimeout(() => document.location.href = '/', 250)
}
const goToUsr = () => {
    $('.loader-wraper').fadeIn(100)
    setTimeout(() => document.location.href = '/adminUser', 250)
}
function validarLetras(e) {
    var tecla = (document.all) ? e.keyCode : e.which;
    if (tecla == 8) return true;
    var patron = /^([^0-9]*)$/;
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

const updatePass = () => {
    if ($('#passNew').val()!=''&&$('#passNewR').val()!=''&&$('#passOld').val()!=''&&$('#passNew').val()==$('#passNewR').val()&&$('#passNew').val()!=$('#passOld').val())
        return $.ajax({
            type: 'PUT',
            url: './api/user/auth',
            data: {
                password: $("#passNew").val(),
                oldPassword: $("#passOld").val()
            }
        }).done(response => {
            if (response == 'OK') {
                hotsnackbar('hsdone', "contraseña modificada!.")
            }
        }).fail((response) => {
            switch (response.status) {
                case 401:
                    $("#passOld").addClass('error')
                    hotsnackbar('hserror', "contraseña incorrecta!.")
                    break
                default:
                    hotsnackbar('hserror', "Parece que el servidor no responde..")
            }
        })
    if($('#passOld').val()==''){
        $('#passOld').addClass('error')
        return hotsnackbar('hserror', 'Debe proveer la contraseña actual!')
    }
    if($('#passNew').val()!=$('#passNewR').val()){
        $('#passNew').addClass('error')
        $('#passNewR').addClass('error')
        return hotsnackbar('hserror', 'Estos campos deben ser iguales!')
    }
    if($('#passNew').val()==$('#passOld').val()){
        $('#passNew').addClass('error')
        $('#passOld').addClass('error')
        $('#passNewR').addClass('error')
        return hotsnackbar('hserror', 'La nueva contraseña debe ser distinta de la actual!')
    }
    $('#passNew').addClass('error')
    $('#passNewR').addClass('error')
    hotsnackbar('hserror', 'Debes proveer la nueva contraseña!')
}

const enviar = () => {
    if (validar())
        $.ajax({
            type: 'PUT',
            url: './api/user/',
            data: {
                name: $("#nombre").val(),
                email: $("#correo").val()
            }
        }).done(response => {
            if (response == 'OK') {
                $('#usrName').html(`Modificacion de usuario | <b>${$("#nombre").val()}</b>`);
                hotsnackbar('hsdone', "Datos modificados!.")
            }
        }).fail((response) => {
            switch (response.status) {
                case 400:
                    $("#correo").addClass('error')
                    hotsnackbar('hserror', "el correo ya se encuentra registrado, contacte a soporte.")
                    break
                default:
                    hotsnackbar('hserror', "Parece que el servidor no responde..")
            }
        })
    else
        hotsnackbar('hserror', errorText)
}

var errorText;
const validar = () => {
    if (checkUserChange({
        name: $("#nombre").val(),
        email: $("#correo").val()
    })) {
        $("#nombre").addClass('error')
        $("#correo").addClass('error')
        errorText = "Debe modificar sus datos!"
        return false;
    }
    var correcto = true;
    $("#nombre").removeClass("error");
    $("#correo").removeClass("error");

    if ($("#nombre").val() === "" || $("#nombre").val().length > 50) {
        $("#nombre").addClass("error");
        correcto = false;
    }
    if ($("#correo").val() === "" || $("#correo").val().length > 50) {
        $("#correo").addClass("error");
        correcto = false;
    }
    if (!validarCorreo($("#correo").val()) || $("#correo").val().length > 50) {
        $("#correo").addClass("error");
        correcto = false;
        errorText = "debe introducir un correo valido"
    }

    return correcto;
}

const checkUserChange = u => u.name == user.name && u.email == user.email

function limpiarForm() {
    document.getElementById("form_usuario").reset();
    $("#pass").removeClass("error")
    $("#nombre").removeClass("error");
    $("#correo").removeClass("error");
}

const validarCorreo = val => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(val)