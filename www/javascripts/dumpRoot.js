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
const getUserType = type => {
    switch (type) {
        case 1:
            return 'Administrador:'
        case 2:
            return 'Sub-administrador:'
        default:
            return 'Invitado:'
    }
}

var clicks = 0
const updateTableListener = () =>
    $('#tableReview tbody tr td').unbind('click').on('click', e => {
        clicks++;
        let x = $(e.target).parent().children().toArray()
        if (clicks >= 2) {
            clearTimeout()
            localStorage.setItem('org', JSON.stringify({_id: $(e.target).closest('tr')[0].id, name:$(e.target).closest('tr').children().toArray()[0].innerHTML}))
            $('.loader-wraper').fadeIn(100)
            setTimeout(() => document.location.href = '/dump', 250)
        }
        setTimeout(() => {
            clicks = 0
        }, 500)

    }).contextmenu(e=>e.preventDefault())

$('document').ready(() => {
    user = JSON.parse(localStorage.getItem('user'))
    user&&$('#usrName').html(`Organizaciones | ${getUserType(user.type)}<b>${user.name}</b>`);
    [$('#nombreO'), $('#correo'), $('#nombre')].forEach(e => e.hover(r => $(r.target).removeClass('error')))
    var menu = $('#menuCapa')
    menu.mouseleave(function () { menu.hide() })
    window.t = $('#tableReview').DataTable({
        fixedHeader: {
            header: true,
            footer: true
        },
        "pageLength": 50,
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
                return data.map(e => { return [e.name.toUpperCase(), e.admin.name.toUpperCase(), e._id] })
            }
        },
        "fnCreatedRow": function (nRow, aData, iDataIndex) {
            $(nRow).attr('id', aData[2]);
        },
        'initComplete': () => {
            $('.loader-wraper').fadeOut()
            updateTableListener()
        }
    });

    updateTableListener()
    $('#tableReview_info').html("<p style='word-wrap: break-word; word-break: normal; white-space: normal'>" + $('#tableReview_info').html() + "</p>")

})
