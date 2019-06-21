
const getUserType = type => 'Invitado:'
var clicks = 0
const updateTableListener = () =>
    $('#tableReview tbody tr td').unbind('click').on('click', e => {
        clicks++;
        let x = $(e.target).parent().children().toArray()
        if (clicks >= 2) {
            clearTimeout()
            localStorage.setItem('org', JSON.stringify({ _id: $(e.target).closest('tr')[0].id, name: $(e.target).closest('tr').children().toArray()[0].innerHTML }))
            $('.loader-wraper').fadeIn(100)
            setTimeout(() => document.location.href = '/filemanagement', 250)
        }
        setTimeout(() => {
            clicks = 0
        }, 500)

    }).contextmenu(e => e.preventDefault())
$('document').ready(() => {
    if (localStorage.getItem('first') == 'true') {
        localStorage.setItem('first', false)
        hotsnackbar('hsdone', `Bienvenido, ${JSON.parse(localStorage.getItem('user')).name}!`);
    }
    user = JSON.parse(localStorage.getItem('user'))
    user && $('#usrName').html(`Organizaciones | ${getUserType(user.type)} <b>${user.name}</b>`);
    [$('#nombreO'), $('#correo'), $('#nombre')].forEach(e => e.hover(r => $(r.target).removeClass('error')));
    window.t = $('#tableReview').DataTable({
        fixedHeader: {
            header: true,
            footer: true
        },
        "pageLength": 10,
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
            dataSrc: data => data.map(e => [e.name.toUpperCase(), e.admin.name.toUpperCase(), e._id])
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
})
