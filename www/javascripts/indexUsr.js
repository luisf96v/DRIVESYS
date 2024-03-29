function returnFileSize(number) {
    if (number < 1024) {
        return number + 'bytes';
    } else if (number >= 1024 && number < 1048576) {
        return (number / 1024).toFixed(1) + 'KB';
    } else if (number >= 1048576) {
        return (number / 1048576).toFixed(1) + 'MB';
    }
}
window.firstOne = false
window.banned = ''
window.wasForward = false
window.lastNavigation = ''
window.first = true
window.last
window.hashMap = new Map()
window.location.lasthash = []
window.currentFolder = ''
window.tree = []
window.lastTree = []
window.current = 0


const rollback = (before, element) => {
    if (!element.hasClass('active')) {
        lastNavigation = $('.breadcrumb')[0].innerHTML
        t.clear()
        current = before;
        lastTree = tree
        banned = ''
        //lastTree.pop()
        tree = tree.slice(0, before + 1)
        element.addClass('active')
        $(element).closest('ol').children().toArray().slice(before + 3).forEach(e => $(e).remove());
        firstOne = true
        t.ajax.url(`/api/folder/${tree[before]}/all`).load(() => { updateTableListener(); updateFolderListener() })
        if (current == 0)
            removeHash()
    }
}
const updateHistory = curr => {
    window.location.lasthash.push(window.location.hash);
    window.location.hash = curr.replace(/ /g, '');
}

function goBack() {
    window.location.hash = window.location.lasthash[window.location.lasthash.length - 1];
    window.location.lasthash.pop();
}
let errCount = 0;
window.onhashchange = function () {
    if (firstOne) {
        firstOne = false
        return
    }
    if (window.innerDocClick) {
        window.innerDocClick = false;
    } else {
        if (window.location.hash != '#undefined' && window.location.hash != "") {

            if ((!tree.includes(hashMap.get(window.location.hash))) || (tree.includes(hashMap.get(window.location.hash)) && banned == '')) {
                if (lastNavigation != '') {
                    //first = false
                    last = window.location.hash
                    simulateGoBack(window.location.hash)
                    if (lastNavigation) {
                        last = window.location.lasthash[window.location.lasthash.length - 1]
                        tree = lastTree
                        current = tree.length - 1
                        $('.breadcrumb').html(lastNavigation)
                    }
                    lastNavigation = ''
                    return
                }
                if (!(tree.includes(hashMap.get(window.location.hash)) && banned == '')) {
                    wasForward = true
                    banned = window.location.hash
                    if (errCount >= 2) {
                        $.confirm({
                            title: 'Atención!',
                            content: 'Destino inaccesible, Redireccionando a Raíz...',
                            autoClose: 'confirm|3000',
                            color: 'red',
                            buttons: {
                                confirm: {
                                    text: 'Ok',
                                    action: () => {
                                        window.location.reload()
                                    }
                                }
                            }
                        });
                    }
                    hotsnackbar('hserror', 'Destino inaccesible.')
                    errCount++
                    return;
                }
            }
            if (wasForward) {
                wasForward = false
                return
            }
            if (lastNavigation) {
                last = window.location.lasthash[window.location.lasthash.length - 1]
                tree = lastTree
                current = tree.length - 1
                $('.breadcrumb').html(lastNavigation)
            }
            last = window.location.lasthash[window.location.lasthash.length - 1]
            goBack();
            simulateGoBack()
            lastNavigation = ''

        } else {
            if (wasForward) {
                wasForward = false
                return
            }
            window.location.lasthash = ['']
            simulateGoBack()
            removeHash()
        }
    }
}
$(document).mouseenter(() => {
    //User's mouse is inside the page.
    window.innerDocClick = true;
})

$(document).mouseleave(() => {
    //User's mouse is inside the page.
    window.innerDocClick = false;
})
const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const setImage = ext => {
    switch (ext) {
        case 'Imagen':
            return '040-file-picture.svg'
        case 'PDF':
            return '480-file-pdf.svg'
        case 'Word':
            return '482-file-word.svg'
        case 'Open Office':
            return '481-file-openoffice.svg'
        case 'Texto':
            return '039-file-text2.svg'
        case 'Excel':
            return '483-file-excel.svg'
        case 'Power Point':
            return 'icons8-microsoft-powerpoint.svg'
        case 'Compreso':
            return '044-file-zip.svg'
        case 'Fichero':
            return '038-files-empty.svg'
        default:
            return undefined;
    }
}


const simulateGoBack = (hash = "") => {
    if (hash == "") {
        if (tree.length > 1) {
            current -= 2
            $('.breadcrumb li').last().remove()
            $('.breadcrumb li').last().addClass("active");
            tree.pop()
            t.ajax.url(`/api/folder/${tree[tree.length - 1]}/all`).load(() => { updateTableListener(); updateFolderListener() })
        }
        return
    }
    $('.breadcrumb li').removeClass("active");
    $($('.breadcrumb').toArray()[0]).append($(`<li class='active' onclick="rollback(${current} ,$(this))"/>`).append($(`<a href="${hash.slice(0, hash.length - 5).slice(1)}"/>`)).append(hash.slice(0, hash.length - 5).slice(1)))
    t.ajax.url(`/api/folder/${hashMap.get(hash)}/all`).load(() => { updateTableListener(); updateFolderListener() })
}

updateTableListener = () => $("#tableReview tbody tr td").contextmenu(e => e.preventDefault())
const getUserType = type => {
    switch (type) {
        case 4:
            return 'Administrador:'
        case 5:
            return 'Sub-administrador:'
        case 3:
            return 'Invitado:'
        default:
            return 'Usuario:'
    }
}
var clicks = 0
const updateTableListenerd = () =>
    $('#tableReview tbody').on('click', e => {// tbody tr td
        if (e.target.tagName == 'BUTTON')
            return
        clicks++;
        let x = e.target.tagName == 'TD' ? $(e.target).parent().children().toArray() : $(e.target).closest('td').parent().children().toArray(),
            tr = $(e.target).closest('tr')[0]
        if (clicks >= 2 && t.data().toArray().find(x => x.indexOf(tr.id) != -1).indexOf('Carpeta') != -1) {
            clearTimeout()
            if (!tree.includes(tr.id)) {
                $('.breadcrumb li').removeClass("active");
                $($('.breadcrumb').toArray()[0]).append($(`<li class='active' onclick="rollback(${current} ,$(this))"/>`).append($(`<a href="#${x[0].firstChild.innerText.trim() + tr.id.slice(tr.id.length - 5)}">${x[0].firstChild.innerText.trim()}</a>`)))
                updateHistory(x[0].firstChild.innerText.trim() + tr.id.slice(tr.id.length - 5))
                t.ajax.url(`/api/folder/${tr.id}/all`).load(() => { updateTableListener(); updateFolderListener() })
            } else {
                simulateGoBack()
                goBack()
            }
        }
        setTimeout(() => { clicks = 0 }, 500)
        if (t.data().toArray().find(x => x.indexOf(tr.id) != -1).indexOf('Carpeta') == -1) {
            if (e.target.outerHTML != "<span class=\"fa fa-window-close\" style=\"margin-left:calc(50% - 20px); color: #FF5722\" onclick=\"deleteRow($(this))\"></span>")
                insertDataDM(x.map(e => $(e)))
        }
    })

jQuery.fn.dataTable.ext.type.order['file-size-pre'] = function (data) {
    var matches = data.match(/^(\d+(?:\.\d+)?)\s*([a-z]+)/i);
    var multipliers = {
        b: 1,
        bytes: 1,
        kb: 1000,
        kib: 1024,
        mb: 1000000,
        mib: 1048576,
        gb: 1000000000,
        gib: 1073741824,
        tb: 1000000000000,
        tib: 1099511627776,
        pb: 1000000000000000,
        pib: 1125899906842624
    };

    if (matches) {
        var multiplier = multipliers[matches[2].toLowerCase()];
        return parseFloat(matches[1]) * multiplier;
    } else {
        return -1;
    };
};
const supportedMIMES = ['application/pdf', 'text/plain', 'image/jpeg', 'image/png', 'text/plain; charset=utf-8']
window.cntnttype = ''
const getTableData = info => {
    colNames = ['Nombre', 'Tipo', 'Tamaño']
    data = colNames.reduce((z, e, i) => z + '<tr><td style="max-width: 120px; background-color: #f9f9f9">' + colNames[i] + ':' + '</td><td><p style="word-break: break-all">' + (i == 0 ? $(info[0]).closest_descendent('p')[0].innerHTML : info[i]) + '</p></td></tr>', "")
    return $("<div style='margin-left: 5%; max-width: 90%; border-style: solid; border-width: 1px;'/>").append($('<table class="table table-bordered" style="max-width: 100%; margin-bottom: 0;" id="TableR"/>').append(data)[0])
}
const validateWindowWidth = () => {
    if ($(window).width() > 552) {
        t.column(1).visible(true);
        t.column(3).visible(true);
        $('#orgName').css({'border-right': '1px solid #ccc', 'text-align': 'left'})
        $('#usrName').show()
        return
    }
    if ($(window).width() > 400) {
        t.column(1).visible(true);
        t.column(3).visible(false);
        $('#orgName').css({border: 'none'}).parent().css('text-align', 'center')
        $('#usrName').hide()
        return
    }
    $('#orgName').css({border: 'none'}).parent().css('text-align', 'center')
    $('#usrName').hide()
    t.column(2).visible(false);
    t.column(1).visible(false);
    t.column(3).visible(false);

}
$('document').ready(() => {
    if (!JSON.parse(localStorage.getItem('org'))) {
        logout()
    }
    if (localStorage.getItem('first') == 'true') {
        localStorage.setItem('first', false)
        hotsnackbar('hsdone', `Bienvenido, ${JSON.parse(localStorage.getItem('user')).name}!`);
    }
    user = JSON.parse(localStorage.getItem('user'))
    user && $('#usrName').html(`Archivos | ${getUserType(user.type)}<b>${user.name}</b>`);
    fetch('/inxUsrNav', {
        method: 'GET'
    }).then(async e => {
        nav = await e.text()
        $("#side").html(nav)
        type = JSON.parse(localStorage.getItem('user')).type
        /*if(type==1||type==2)
            $('#tipo').html(`${$('#tipo').html()}<option value="4" active>Trabajador</option>`)*///preguntar a pablo
    });
    removeHash()
    $('.folder').hover(updateFolderListener())
    updateTableListenerd()
    
    $(window).resize(validateWindowWidth)
    window.t = $('#tableReview').DataTable({
        fixedHeader: {
            header: true,
            footer: true
        },
        columnDefs: [
            { type: 'file-size', targets: 2 }
        ],
        processing: true,
        serverSide: false,
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
            url: `/api/org/${JSON.parse(localStorage.getItem('org'))._id}/root`,
            method: 'get',
            dataSrc: data => {
                currentFolder = data.id || data._id
                tree[current] = data.id || data._id
                if (data.parent) {
                    data.parent.name = '..Atrás'
                    data.data.push(data.parent)
                }
                current++
                return data.data.map(e => {
                    let today = new Date(e.date)
                    hashMap.set("#" + e.name.replace(/ /g, '') + e._id.slice(e._id.length - 5), e._id)
                    let dateCreation = today.getDate() + ' de ' + monthNames[today.getMonth()] + ', ' + today.getFullYear()
                    return ['<span style="display: inline; margin-right: 6px; vertical-align: text-bottom;"><img src="/images/' + (e.type ? setImage(e.type) : e.name == '..Atrás' ? '003-folder-upload.svg' : '048-folder.svg') + '" style="float: inline-start; width:16px; heigth:16px;"></img><p style="display: inline-block; word-wrap: break-word; word-break: break-all; white-space: normal; margin-left: 3px">' + e.name + '</p></span>',
                    e.type || "Carpeta",
                    e.type ? returnFileSize(e.size) : "––",
                        dateCreation, e._id, e.type]
                })
            }
        },
        order: [[1, "asc"], [0, "asc"]],
        "pageLength": 10,
        "fnCreatedRow": function (nRow, aData, iDataIndex) {
            $(nRow).attr('id', aData[4]);
            !aData[5] && $(nRow).addClass('folder')
        },
        'initComplete': () => {
            $('.loader-wraper').fadeOut()
            //updateHistory('root')
            updateTableListener()
            updateFolderListener()
        }
    });
    validateWindowWidth()
    updateTableListener()
    updateFolderListener()
    $('#tableReview_info').html(`<p style='word-wrap: break-word; word-break: normal; white-space: normal'>${$('#tableReview_info').html()}</p>`)

})
