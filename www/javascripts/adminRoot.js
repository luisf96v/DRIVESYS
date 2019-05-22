var currentRow = 0;

const deleteRow = element => {//delete from db
    t.row(element.parents('tr')).remove().draw();
}

const validarLetras = e => {
    var tecla = (document.all) ? e.keyCode : e.which;
    if (tecla == 8) return true;
    var patron = /^([^0-9]*)$/;
    var te = String.fromCharCode(tecla);
    return patron.test(te);
}
window.editing = false
window.currentRow = undefined
window.currentId = undefined
window.currentElement = undefined
window.orgs = []
function showMenu(e) {
    e.preventDefault()
    if (!$(e.target).hasClass("dataTables_empty")) {
        let deltaY = 0
        let deltaX = 79
        if (e.clientY > 64)
            deltaY = 9
        $('#menuCapa').css({ 'left': e.clientX - deltaX, 'top': e.clientY - deltaY })
        $('#menuCapa').show()
        currentRow = e.currentTarget
        currentElement = e.target
    }
}


const filterFunction = () => {
    var input, filter, ul, li, a, i;
    input = document.getElementById("correo");
    filter = input.value.toUpperCase();
    div = document.getElementById("myDropdown");
    a = div.getElementsByTagName("a");
    Array.from(a).forEach(e => {
        txtValue = e.textContent || e.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            e.style.display = "";
        } else {
            e.style.display = "none";
        }
    })
}
const validateInstertOrg = () => {
    flag = true
    error = []
    if ($('#nombreO').val() == "") {
        $('#nombreO').addClass('error')
        error.push('Nombre de la organización')
        flag = false
    }
    if (!(/^[a-zA-Z0-9.!#$%&’*+\/=?^_`{|}~-]+@[a-zA-Z0-9]+(?:\.([a-zA-Z]{2,3}))+$/.test($('#correo').val()))) {
        $('#correo').addClass('error')
        error.push('Correo')
        flag = false
    }
    if ($('#nombre').val() == "") {
        $('#nombre').addClass('error')
        error.push('Nombre del administrador &nbsp&nbsp')
        flag = false
    }
    if (!flag)
        hotsnackbar('hserror', error.reduce((z, e, i, a) => i + 1 < a.length ? z + '- ' + e + '<br>' : z + '- ' + e, "Error con: <br>"))
    return flag
}
const disable = id => $.confirm({
    title: 'Confirmar Desactivar!',
    type: 'red',
    closeIcon: true,
    content: `Deseas desactivar la empresa: ${orgs.find(e => e._id == id).name}?`,
    buttons: {
        aceptar: {
            text: 'Aceptar',
            action: () => {
                updateEnable(id, false)
                $.alert({
                    title: 'Información',
                    content: 'Empresa desactivada!',
                    type: 'orange'
                })
            },
            btnClass: 'btn-danger'
        },
        cancelar: function () {
        }
    }
});

const enable = id => $.confirm({
    title: 'Confirmar Activar!',
    type: 'green',
    closeIcon: true,
    content: `Deseas activar la empresa: ${orgs.find(e => e._id == id).name}?`,
    buttons: {
        aceptar: {
            text: 'Aceptar',
            action: () => {
                updateEnable(id, true)
                $.alert({
                    title: 'Información',
                    content: 'Empresa activada!',
                    type: 'orange'
                })
            },
            btnClass: 'btn-success'
        },
        cancelar: function () {
        }
    }
});
//begin of updateEnable
const updateEnable = (id, en) =>
    fetch(`/api/org/${id}`, {
        method: "PUT",
        body: JSON.stringify({
            org: {
                enabled: en
            }
        }),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then(async e => {//update tiene que devolver org!!
        let newOrg = await e.json()
        orgs = orgs.filter(e => e._id != id)
        orgs.push(newOrg)
        t.row($(`#${id}`)).remove()
        t.row.add([newOrg.name.toUpperCase(), newOrg.admin.name.toUpperCase(), `<div style='width: 100px !important;'><button class='btn btn-info btn-xs' onclick='edit("${id}")'>Editar</button>${newOrg.enabled ? `<button style='margin-left:5px' class='btn btn-danger btn-xs' onclick='disable("${id}")'>Desactivar</button>` : `<button style='margin-left:5px' class='btn btn-success btn-xs' onclick='enable("${id}")'>Activar</button>`}</div>`]).node().id = id;
        t.draw(false)
        updateTableListener()
    }).catch(console.log)
//end of update Enable

const resetModal = () => {
    $('#nombreO').val('')
    $('#nombre').val('')
    $('#correo').val('')
}

const XOR = (a, b) => (a || b) && !(a && b)

var clicks = 0
const updateTableListener = () =>
    $('#tableReview tbody tr td').unbind('click').on('click', e => {
        clicks++;
        let x = $(e.target).parent().children().toArray()
        if (clicks >= 2) {
            clearTimeout()
            localStorage.setItem('org', $(e.target).closest('tr')[0].id)
            $('.loader-wraper').fadeIn(100)
            setTimeout(() => document.location.href = '/filemanagement', 250)
        }
        setTimeout(() => {
            clicks = 0
        }, 500)

    }).contextmenu(showMenu)
const getTableData = info => {
    colNames = ['Nombre', 'Tipo', 'Tamaño', 'Última modificación']
    data = info.reduce((z, e, i) => z + '<tr><td>' + colNames[i] + ':' + '</td><td>' + (i == 0 ? e.children().last()[0].innerHTML : e.html()) + '</td></tr>', "")
    return $("<div class='container' style='max-width: 90%'/>").append($('<table class="table table-bordered" style="max-width: 100%"/>').append(data)[0])
}
const edit = async e => {
    editing = true;
    let id = 'none'
    if (e.preventDefault) {
        e.preventDefault()
        id = $(currentElement).closest('tr').prop('id')
    } else id = e
    var org = orgs.find(e => e._id == id)
    currentId = id
    $("#nombreO").val(org.name).removeClass('error')
    $('#correo').val(org.admin.email).removeClass('error')
    $("#nombre").val(org.admin.name).removeClass('error')
    let users = await fetch(`/api/org/${currentId}/users`)
    window.usersArr = await users.json()
    anchors = usersArr.reduce((z, e) => e.type != 4 ? z + `<a href='' class='emails'>${e.email}<p style='margin: auto; font-size: 8px'>${e.name}</p></a>` : z, '')
    $("#myDropdown").html(anchors)
    $('.emails').click(e => {
        e.preventDefault()
        let email = $(e.currentTarget).html().split('<')[0]
        let user = usersArr.find(e => e.email == email)
        $("#correo").val(email)
        $("#nombre").val(user.name)
    })
    $("#modalTittle").html("Modificar Organización")
    $('#modalRow').modal()

}
const validateChange = (id, name, email) => {
    let org = orgs.find(e => e._id == currentId)
    return currentId != '' && (org.name.toUpperCase() != name.toUpperCase() || org.admin.email.toLowerCase() != email.toLowerCase())
}
const validateOtherOrgs = (id, name, email) => {
    let newOrgs = orgs.filter(e => e._id != id)
    return !newOrgs.some(e => e.name.toUpperCase() == name.toUpperCase() || e.admin.email.toLowerCase() == email.toLowerCase())
}
$('document').ready(() => {
    [$('#nombreO'), $('#correo'), $('#nombre')].forEach(e => e.hover(r => $(r.target).removeClass('error')))
    var menu = $('#menuCapa')
    menu.mouseleave(function () { menu.hide() })
    window.t = $('#tableReview').DataTable({
        fixedHeader: {
            header: true,
            footer: true
        },
        "pageLength": 50,
        "columnDefs": [
            { "orderable": false, "targets": 2 }
        ],
        language: {
            "sProcessing": "Procesando...",
            "sLengthMenu": "Mostrar _MENU_ registros",
            "sZeroRecords": "No se encontraron resultados",
            "sEmptyTable": "Ningún dato disponible en esta tabla",
            "sInfo": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
            "sInfoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
            "sInfoFiltered": "(filtrado de un total de _MAX_ registros)",
            "sInfoPostFix": "",
            "sSearch": "Buscar:",
            "sUrl": "",
            "sInfoThousands": ",",
            "sLoadingRecords": "Cargando...",
            "oPaginate": {
                "sFirst": "Primero",
                "sLast": "Último",
                "sNext": "Siguiente",
                "sPrevious": "Anterior"
            },
            "oAria": {
                "sSortAscending": ": Activar para ordenar la columna de manera ascendente",
                "sSortDescending": ": Activar para ordenar la columna de manera descendente"
            }
        },
        "lengthMenu": [10, 25, 50],
        'ajax': {
            url: '/api/org',
            method: 'get',
            dataSrc: data => {
                window.orgs = data
                return data.map(e => { return [e.name.toUpperCase(), e.admin.name.toUpperCase(), `<div style='width: 100px !important;'><button class='btn btn-info btn-xs' onclick='edit("${e._id}")'>Editar</button>${e.enabled ? `<button style='margin-left:5px' class='btn btn-danger btn-xs' onclick='disable("${e._id}")'>Desactivar</button>` : `<button style='margin-left:5px' class='btn btn-success btn-xs' onclick='enable("${e._id}")'>Activar</button>`}</div>`, e._id] })
            }
        },
        "fnCreatedRow": function (nRow, aData, iDataIndex) {
            $(nRow).attr('id', aData[3]);
        },
        'initComplete': () => {
            $('.loader-wraper').fadeOut()
            updateTableListener()
        }
    });

    updateTableListener()
    $('#tableReview_info').html("<p style='word-wrap: break-word; word-break: normal; white-space: normal'>" + $('#tableReview_info').html() + "</p>")


    $('#createOrg').click(e => {
        e.preventDefault()
        $("#myDropdown").html('')
        $("#modalTittle").html("Crear nueva Organización")
        resetModal()
        editing = false
        $('#modalRow').modal()
    })
    $("#correo").focusin(() => $(".dropdown").fadeIn()).focusout(() => $(".dropdown").fadeOut())

    $('#saveC').click(() => {
        var msg = editing ? ['los datos no pueden permanecer iguales!', 'se ha modificado la Organización.']
            : ['Hay un nombre con conflicto!', 'se ha creado la Organización.']
        var flag = true, flag1 = false, flag2 = false;
        if (validateInstertOrg()) {
            if (orgs.length && !orgs.every(e => { return (flag = (e.name.toUpperCase() != $("#nombreO").val().toUpperCase())) && e.admin.email.toLowerCase() != $("#correo").val().toLowerCase() })) {
                if (flag) {
                    msg[0] = 'El correo ingresado ya existe!'
                    flag2 = true;
                }
                else {
                    flag1 = true
                }
                flag = false
            }
            if (!editing && !flag1) {
                fetch('/api/org', {
                    method: 'POST',
                    body: JSON.stringify({
                        org: {
                            name: $("#nombreO").val().toUpperCase()
                        },
                        admin: {
                            name: $("#nombre").val().toUpperCase(),
                            email: $("#correo").val().toLowerCase()
                        }
                    }),
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }).then(async (e) => {
                    x = await e.json()
                    if (!x.message) {
                        orgs = orgs.concat(x)
                        t.row.add([$('#nombreO').val().toUpperCase(), $('#nombre').val().toUpperCase(), `<div style='width: 100px !important;'><button class='btn btn-info btn-xs' onclick='edit("${x._id}")'>Editar</button>${x.enabled ? `<button style='margin-left:5px' class='btn btn-danger btn-xs' onclick='disable("${x._id}")'>Desactivar</button>` : `<button style='margin-left:5px' class='btn btn-success btn-xs' onclick='enable("${x._id}")'>Activar</button>`}</div>`]).node().id = x._id;
                        t.draw(false)
                        $('#modalRow').modal('toggle');
                        updateTableListener()
                        hotsnackbar('hsdone', msg[1])
                        return
                    }
                    hotsnackbar('hserror', x.message)
                    $("#correo").addClass('error')
                }).catch(console.log)
                return
            }
            if (!orgs.length ||
                flag ||
                editing && (validateChange(currentId, $("#nombreO").val(), $("#correo").val()) && validateOtherOrgs(currentId, $("#nombreO").val(), $("#correo").val()))
            ) {
                if (editing) {
                    org = orgs.find(e => e._id == currentId)
                    user = usersArr.find(e => e.email == $("#correo").val())
                    fetch(`/api/org/${currentId}`, {
                        method: "PUT",
                        body: JSON.stringify({
                            org: {
                                id: org._id,
                                name: $("#nombreO").val().toUpperCase()
                            },
                            admin: (user) ?
                                { _id: user._id } :
                                {
                                    name: $("#nombre").val().toUpperCase(),
                                    email: $("#correo").val().toLowerCase(),
                                    password: 'changeThis',
                                    type: 4
                                }
                        }),
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        }
                    }).then(async e => {
                        let newOrg = await e.json()
                        if (!newOrg.message) {
                            orgs = orgs.filter(e => e._id != currentId)
                            orgs = orgs.concat(newOrg)
                            t.row($(`#${currentId}`)).remove().draw(false)
                            t.row.add([$('#nombreO').val().toUpperCase(), $('#nombre').val().toUpperCase(), `<div style='width: 100px !important;'><button class='btn btn-info btn-xs' onclick='edit("${currentId}")'>Editar</button>${newOrg.enabled ? `<button style='margin-left:5px' class='btn btn-danger btn-xs' onclick='disable("${currentId}")'>Desactivar</button>` : `<button style='margin-left:5px' class='btn btn-success btn-xs' onclick='enable("${currentId}")'>Activar</button>`}</div>`]).node().id = currentId;
                            t.draw(false)
                            editing = false
                            resetModal()
                            $('#modalRow').modal('toggle');
                            updateTableListener()
                            hotsnackbar('hsdone', msg[1])
                        }
                        else {
                            $('#correo').addClass('error')
                            hotsnackbar('hserror', 'ya existe este correo en el sistema, contacte con soporte')
                        }
                    }).catch(console.log)
                    return
                }
            }
            if (editing)
                $('#correo').addClass('error')
            if (flag1)
                $('#nombreO').addClass('error')
            hotsnackbar('hserror', msg[0])
        }
    })

    $('#edit').click(edit)
})
