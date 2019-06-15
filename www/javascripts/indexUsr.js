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

const deleteRow = element => {//delete from db
    $.confirm({
        title: 'Confirmar Eliminar!',
        type: 'red',
        closeIcon: true,
        content: `Deseas eliminar la entrada: ${element.parents('tr')[0].outerHTML.split('&nbsp')[1].split("<")[1].split(">")[1]}?`,
        buttons: {
            aceptar: {
                text: 'Aceptar',
                action: () => {
                    if ($(element.parents('tr')[0]).children()[1].innerHTML == 'Carpeta') {
                        fetch(`/api/folder/${element.parents('tr')[0].id}/delete`, {
                            method: 'DELETE',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            }
                        }).then(() =>
                            $.alert({
                                title: 'Información',
                                content: 'Archivo eliminado!',
                                type: 'green',
                                onClose: () => t.row(element.parents('tr')).remove().draw()
                            })).catch(console.log)
                    }
                },
                btnClass: 'btn-danger'
            },
            cancelar: function () {
            }
        }
    });

}
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
        t.ajax.url(`/api/folder/${tree[before]}/all`).load(updateTableListener)
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

const validarLetras = e => {
    var tecla = (document.all) ? e.keyCode : e.which;
    if (tecla == 8) return true;
    var patron = /^([0-9]*)$/;
    var te = String.fromCharCode(tecla);
    return patron.test(te);
}

const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const setImage = ext => {
    switch (ext) {
        case 'jpg':
        case 'png':
        case 'gif':
        case 'JPG':
        case 'PNG':
        case 'GIF':
            return '040-file-picture.svg'
            break
        case 'pdf':
        case 'PDF':
            return '480-file-pdf.svg'
            break
        case 'doc':
        case 'docx':
        case 'DOC':
        case 'DOCX':
            return '482-file-word.svg'
            break
        case 'txt':
        case 'TXT':
            return '039-file-text2.svg'
            break
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
            t.ajax.url(`/api/folder/${tree[tree.length - 1]}/all`).load(updateTableListener)
        }
        return
    }
    $('.breadcrumb li').removeClass("active");
    $($('.breadcrumb').toArray()[0]).append($(`<li class='active' onclick="rollback(${current} ,$(this))"/>`).append($(`<a href="${hash.slice(0, hash.length - 5).slice(1)}"/>`)).append(hash.slice(0, hash.length - 5).slice(1)))
    t.ajax.url(`/api/folder/${hashMap.get(hash)}/all`).load(updateTableListener)
}
const removeHash = () => {
    var scrollV, scrollH, loc = window.location;
    if ("pushState" in history)
        history.pushState("", document.title, loc.pathname + loc.search);
    else {
        // Prevent scrolling by storing the page's current scroll offset
        scrollV = document.body.scrollTop;
        scrollH = document.body.scrollLeft;

        loc.hash = "";

        // Restore the scroll offset, should be flicker free
        document.body.scrollTop = scrollV;
        document.body.scrollLeft = scrollH;
    }
}
updateTableListener = () => $("#tableReview tbody tr td").contextmenu(e => e.preventDefault())

var clicks = 0
const updateTableListenerd = () =>
    $('#tableReview tbody').on('click', e => {// tbody tr td
        if (e.target.tagName == 'SPAN')
            return
        clicks++;
        let x = e.target.tagName == 'TD' ? $(e.target).parent().children().toArray() : $(e.target).closest('td').parent().children().toArray(),
            tr = $(e.target).closest('tr')[0]
        if (clicks >= 2 && (x[1].innerHTML + "").toLowerCase() == 'carpeta') {
            clearTimeout()
            if (!tree.includes(tr.id)) {
                $('.breadcrumb li').removeClass("active");
                $($('.breadcrumb').toArray()[0]).append($(`<li class='active' onclick="rollback(${current} ,$(this))"/>`).append($(`<a href="#${x[0].firstChild.innerText.trim() + tr.id.slice(tr.id.length - 5)}">${x[0].firstChild.innerText.trim()}</a>`)))
                updateHistory(x[0].firstChild.innerText.trim() + tr.id.slice(tr.id.length - 5))
                t.ajax.url(`/api/folder/${tr.id}/all`).load(updateTableListener)
            } else {
                simulateGoBack()
                goBack()
            }
        }
        setTimeout(() => { clicks = 0 }, 500)
        if ((x[1].innerHTML + "").toLowerCase() != 'carpeta') {
            if (e.target.outerHTML != "<span class=\"fa fa-window-close\" style=\"margin-left:calc(50% - 20px); color: #FF5722\" onclick=\"deleteRow($(this))\"></span>")
                insertDataDM(x.map(e => $(e)))
        }
    })
const insertDataDM = (e) => {
    e.pop()
    $.confirm({
        title: 'Descarga archivo',
        closeIcon: true,
        content: '' + getTableData(e)[0].outerHTML,
        buttons: {
            formSubmit: {
                text: 'Descargar',
                btnClass: 'btn-blue',
                action: function () { }
            },
            cancelar: function () {
                //close
            },
        }
    })
}
const getTableData = info => {
    colNames = ['Nombre', 'Tipo', 'Tamaño', 'Última modificación']
    data = info.reduce((z, e, i) => z + '<tr><td>' + colNames[i] + ':' + '</td><td>' + (i == 0 ? e.children().last()[0].innerHTML : e.html()) + '</td></tr>', "")
    return $("<div class='container' style='max-width: 90%'/>").append($('<table class="table table-bordered" style="max-width: 100%"/>').append(data)[0])
}
const getUserType = type => {
    switch(type){
        case 4:
            return 'Administrador de organización:'
        case 5: 
            return 'Sub-administrador de organización:'
        default:
            return 'Usuario:'
        }
}
$(document).ready(function () {
    $(this).addClass("active");
    hotsnackbar('hsdone', `Bienvenido, ${JSON.parse(localStorage.getItem('user')).name}!`)
    removeHash()
    updateTableListenerd()
    window.t = $('#tableReview').DataTable({
        fixedHeader: {
            header: true,
            footer: true
        },
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
                    return ['<span style="display: inline; margin-right: 6px; vertical-align: text-bottom;"><img src="/images/' + (e.type ? setImage(e.type) : e.name == '..Atrás' ? '003-folder-upload.svg' : '048-folder.svg') + '" style="display: inline-block"></img>&nbsp<p style="display: inline-block;word-wrap: break-word; word-break: break-all; white-space: normal">' + e.name + '</p></span>',
                    e.type || "Carpeta",
                        "––",
                        dateCreation,
                    e._id]
                })
            }
        },
        "pageLength": 50,
        "fnCreatedRow": function (nRow, aData, iDataIndex) {
            $(nRow).attr('id', aData[4]);
        },
        'initComplete': () => {
            $('.loader-wraper').fadeOut()
            //updateHistory('root')
            updateTableListener()
        }
    });
    updateTableListener()
});