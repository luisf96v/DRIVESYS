var currentRow = 0;


window.editing = false
window.currentRow = undefined
window.currentId = undefined
window.currentElement = undefined
window.orgs = []

var clicks = 0
const updateTableListener = () =>
    $('#tableReview tbody tr td').unbind('click').on('click', e => {
        clicks++;
        let x = $(e.target).parent().children().toArray()
        if (clicks >= 2 && (x[1].innerHTML + "").toLowerCase() == 'carpeta') {
            clearTimeout()
            localStorage.setItem('org', {_id: $(e.target).closest('tr')[0].id, name:$(e.target).closest('tr').children().toArray()[0].lastChild.innerHTML})
            $('.breadcrumb li').removeClass("active");
            $($('.breadcrumb').toArray()[0]).append($("<li class='active' onclick=rollback(" + current + ",$(this))/>").append($(e.target).parent().children().first()[0].firstChild.innerText))
            t.clear().draw()
        }
        setTimeout(() => {
            clicks = 0
        }, 500)

    }).contextmenu(showMenu)


$('document').ready(() => {
    $(window).on('unload', function(){
        $('.loader-wraper').hide()
    });
    [$('#nombreO'), $('#correo'), $('#nombre')].forEach(e => e.hover(r => $(r.target).removeClass('error')))
    var menu = $('#menuCapa')
    menu.mouseleave(function () { menu.hide() })
    window.t = $('#tableReview').DataTable({
        fixedHeader: {
            header: true,
            footer: true
        },
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
        'initComplete': () => updateTableListener()
    });

})
