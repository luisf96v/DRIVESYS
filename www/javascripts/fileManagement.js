var isAdvancedUpload = function () {
    var div = document.createElement('div');
    return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
}();
(function () {
    var cache = {};

    var _setTimeout = window.setTimeout;
    var _clearTimeout = window.clearTimeout;

    window.setTimeout = function (fn, delay) {
        var id = _setTimeout(function () {
            delete cache[id];  // ensure the map is cleared up on completion
            fn();
        }, delay);
        cache[id] = fn;
        return id;
    }

    window.clearTimeout = function (id) {
        delete cache[id];
        _clearTimeout(id);
    }

    window.getTimeout = function (id) {
        return cache[id];
    }
})();
function showMenu(e) {
    e.preventDefault()
    if (!$(e.target).hasClass("dataTables_empty")) {
        let deltaY = 0
        let deltaX = 79
        if (e.clientY > 64)
            deltaY = 9
        $('#menuCapa').css({ 'left': e.clientX - deltaX, 'top': e.clientY - deltaY })
        $(e.target).closest("tr")[0].getAttribute('data-passr') == 'true' ? $('#reset').addClass('anch-dis') : $('#reset').removeClass('anch-dis')
        $('#menuCapa').show()
        currentRow = $(e.target).closest("tr")
        currentElement = e.target
    }
}
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
var $form = $('.box');
var $input = $form.find('input[type="file"]'),
    $label = $form.find('label'),
    $files = [],
    showFiles = function (files) {
        if (files.length > 0) {
            $label.html('<strong><u>Puedes seguir eligiendo</u> archivos o arrastrandolos aquí</strong>')
            let table = $("<div class='container' style='max-width: 100%;'/>").append(
                $("<table id='tableUpload' class='table table-striped' style='display: table; margin: auto; text-align: left; outline: 2px solid rgb(197, 197, 197);'/>").append(tableFromDataRemovable(files))
            )
            $('#tableDiv').html(table);
            $('.box__button').css("display", "inline-table");
        }
    };

const tableFromDataRemovable = files => Array.from(files)
    .reduce((z, e, i, arr) => z +
        `<tr>
            <td>
                ${e.name}
            </td>
            <td>
                ${(e.name.split('.').length == 1 ? 'Archivo' : e.name.split('.').pop())}
            </td>
            <td>
                ${returnFileSize(e.size)}
            </td>
            <td>
                <span class='fa fa-window-close' style='margin-left:10%; color: #FF5722' onclick='deleteFile("${e.name}", $(this))'></span>
            </td>
        </tr>
        ${(i == arr.length - 1 ? "</tbody>" : "")}`,
        '<thead style="background-color: #337ab7; color: white"> <tr><td style="width:70%">Nombre</td><td>Tipo</td><td>Tamaño</td><td>Quitar</td></tr></thead><tbody>')
const deleteFile = (name, element) => {
    $files = $files.filter(e => e.name != name)
    element.parent().parent().remove()
    if ($('#tableUpload tr').toArray().length == 1) {
        $('#tableDiv').html("")
        $('.box__button').css("display", "none");
        $label.html('<strong><u>Elige archivos</u></strong><span class="box__dragndrop"> o arrastralos aquí</span>.')
    }
}
const deleteRow = element => {//delete from db
    $.confirm({
        title: 'Confirmar Eliminar!',
        type: 'red',
        closeIcon: true,
        content: `Deseas eliminar la entrada: ${$(element).closest('tr').closest_descendent('p')[0].innerHTML}?`,
        buttons: {
            aceptar: {
                text: 'Aceptar',
                action: function() {
                    self = this
                    console.log(self)
                    if ($(element.parents('tr')[0]).children()[1].innerHTML == 'Carpeta') {
                        $.ajax({
                            url: `/api/folder/${element.parents('tr')[0].id}`,
                            type: 'DELETE',
                            contentType: 'Application/json'
                        }).done(response => {
                            if (response == 'Accepted') {
                                self.close()
                                $.alert({
                                    title: 'Información',
                                    content: 'carpeta eliminada!',
                                    type: 'green',
                                    onClose: () => t.row(element.parents('tr')).remove().draw()
                                })
                            }
                            throw 'error'
                        });
                        return false
                    }
                    $.ajax({
                        url: `/api/file/${element.parents('tr')[0].id}`,
                        type: 'DELETE',
                        contentType: 'Application/json'
                    }).done(response => {
                        if (response == 'Accepted') {
                            self.close()
                            $.alert({
                                title: 'Información',
                                content: 'Fichero eliminado!',
                                type: 'green',
                                onClose: () => t.row(element.parents('tr')).remove().draw()
                            })
                        }
                        throw 'error'
                    });
                    return false
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
const solveConflicts = (first = true, type = true, callback) => {
    if (first)
        window.rejectedConflicts = []
    else if (type)
        conflicts.shift()
    else
        rejectedConflicts.push(conflicts.shift())
    prepareData(false, callback)
}
const askModal = () => {
    $('#modalTittle2').html("Atención")
    $('#modalBody2').html(`¿Desea sobreescribir el archivo ${conflicts[0].name}?`)
    $('#modalRow2').modal()
}
const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const prepareData = (first = true, callback) => {
    let data = Array.from(t.rows().data())
    if (first) {
        window.conflicts = $files.filter(e => data.some(ac => ac[0].split('\">')[3].split("<")[0] == e.name))
        solveConflicts(true, true, callback)
    }
    else if (conflicts.length) {
        $.confirm({
            title: 'Confirmar Sobreescribir!',
            type: 'orange',
            closeIcon: true,
            content: `Deseas sobreescribir el archivo: ${conflicts[0].name}?`,
            buttons: {
                aceptar: {
                    text: 'Aceptar',
                    action: () => {
                        $.alert({
                            //Update file
                            title: 'Información',
                            content: 'Archivo sobreescrito!',
                            type: 'orange',
                            onClose: () => solveConflicts(false, true, callback)
                        })
                    },
                    btnClass: 'btn-warning'
                },
                cancelar: function () {
                    solveConflicts(false, false, callback)
                }
            }
        });
    } else {
        $('input[type=file]')[0].files = FileListItem($files.filter(e => !rejectedConflicts.some(r => r == e)))
        callback && callback()
    }

}
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

const FileListItem = a => {
    a = [].slice.call(Array.isArray(a) ? a : arguments)
    for (var c, b = c = a.length, d = !0; b-- && d;) d = a[b] instanceof File
    if (!d) throw new TypeError("expected argument to FileList is File or array of File objects")
    for (b = (new ClipboardEvent("")).clipboardData || new DataTransfer; c--;) b.items.add(a[c])
    return b.files
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
updateTableListener = () => $("#tableReview tbody tr td").contextmenu(showMenu)
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
const getFilePreview = async (e) => {
    let result = await fetch(`/api/file/${e[0].parent()[0].id}`, {
        method: "GET",
        //body: JSON.stringify(search),
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        }
    })
    console.log(result)
    return '<iframe style="width:100%;height:500px;" src="data:application/pdf;base64,' + result.data + '"></iframe>'
}
var clicks = 0
const updateTableListenerd = () =>
    $('#tableReview tbody').on('click', e => {// tbody tr td
        if (e.target.tagName == 'BUTTON')
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
const editRow = async e => {
    $.confirm({
        title: 'Modificar entrada',
        type: 'blue',
        content: `<form action="" class="formName">
                    <div class="form-group">
                        <label>Nuevo nombre de la entrada</label>
                        <input type="text" placeholder="Nombre de entrada" class="name form-control" required value='${$(e).closest('tr').closest_descendent('p')[0].innerHTML}' />
                    </div>
                </form>`,
        buttons: {
            formSubmit: {
                text: 'Guardar',
                btnClass: 'btn-blue',
                action: function () {
                    self = this
                    if (this.$content.find('.name').val() == $(e).closest('tr').closest_descendent('p')[0].innerHTML) {
                        hotsnackbar('hserror', 'Debes modificar el nombre')
                        this.$content.find('.name').addClass('error')
                        return false
                    }
                    if (Array.from(t.rows().data()).some(e => e[0].split('\">')[3] == `${this.$content.find('.name').val()}</p></span>`)) {
                        hotsnackbar('hserror', 'Ya existe un registro con este nombre en esta carpeta!')
                        this.$content.find('.name').addClass('error')
                        return false
                    }
                    if ($(e).closest('tr').children().toArray()[1].innerHTML == 'Carpeta') {
                        $.ajax({
                            url: `/api/folder/${$(e).closest('tr')[0].id}`,
                            type: 'PUT',
                            data: JSON.stringify({
                                name: self.$content.find('.name').val()
                            }),
                            contentType: 'Application/json'
                        }).done(async resp => {
                            console.log(resp)
                            if (resp) {
                                t.row(e.closest('tr')[0]).remove().draw()
                                let newO = resp
                                    , today = new Date(newO.date)
                                    , dateCreation = today.getDate() + ' de ' + monthNames[today.getMonth()] + ', ' + today.getFullYear()
                                t.row.add(['<span style="display: inline; margin-right: 6px; vertical-align: text-bottom;"><img src="/images/048-folder.svg" style="float: inline-start; width:16px; heigth:16px;"></img><p style="display: inline-block; word-wrap: break-word; word-break: break-all; white-space: normal; margin-left: 3px">' + newO.name + '</p></span>',
                                    "Carpeta",
                                    "––",
                                    dateCreation,
                                    `<div style='width: 100%; text-align:center;'><button class='btn btn-info btn-xs' onclick='editRow($(this))'>Editar</button> <button style='margin-left:5px' class='btn btn-danger btn-xs' onclick='deleteRow($(this))'>Eliminar</button></div>`,
                                    newO._id
                                ])//.node().id = newO._id
                                t.draw('false')
                                updateTableListener()
                            }
                        }).fail(console.log)
                        return
                    }
                    $.confirm({
                        title: 'Confirmar modificación',
                        content: 'Estás a punto de modificar el nombre de un archivo, si la extensión del archivo fue cambiada, puede que este quede corrupto!',
                        type: 'orange',
                        buttons: {
                            Aceptar: {
                                btnClass: 'btn-warning',
                                action: () => $.ajax({
                                    url: `/api/file/${$(e).closest('tr')[0].id}`,
                                    type: 'PUT',
                                    data: JSON.stringify({
                                        name: self.$content.find('.name').val()
                                    }),
                                    contentType: 'Application/json'
                                }).done(async resp => {
                                    console.log(resp)
                                    if (resp) {
                                        t.row($(e).closest('tr')[0]).remove().draw()
                                        let newO = resp
                                            , today = new Date(newO.date)
                                            , dateCreation = today.getDate() + ' de ' + monthNames[today.getMonth()] + ', ' + today.getFullYear()
                                        t.row.add(['<span style="display: inline; margin-right: 6px; vertical-align: text-bottom;"><img src="/images/' + setImage(newO.type) + '" style="float: inline-start; width:16px; heigth:16px;"></img><p style="display: inline-block; word-wrap: break-word; word-break: break-all; white-space: normal; margin-left: 3px">' + newO.name + '</p></span>',
                                        newO.type,
                                        returnFileSize(newO.size),
                                            dateCreation,
                                        `<div style='width: 100%; text-align:center;'><button class='btn btn-info btn-xs' onclick='editRow($(this))'>Editar</button> <button style='margin-left:5px' class='btn btn-danger btn-xs' onclick='deleteRow($(this))'>Eliminar</button></div>`,
                                        newO._id])//.node.id = newO._id
                                        t.draw('false')
                                        updateTableListener()
                                    }
                                })
                            },
                            Cancelar: function () {

                            }
                        }
                    })
                }
            },
            cancelar: function () {
                //close
            },
        },
        onContentReady: function () {
            // bind to events
            self = this
            this.$content.find('.name').hover(() => self.$content.find('.name').removeClass('error'))
            var jc = this;
            this.$content.find('form').on('submit', function (e) {
                // if the user submits the form by pressing enter in the field.
                e.preventDefault();
                jc.$$formSubmit.trigger('click'); // reference the button and click it
            });
        },
        closeIcon: true
    });
}
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
const supportedMIMES = ['application/pdf', 'text/plain', 'image/jpeg', 'image/png', 'text/plain; charset=utf-8', 'text/html; charset=utf-8']
window.cntnttype = ''
const timeout = (ms, promise) => {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            reject(new Error("timeout"))
        }, ms)
        promise.then(resolve, reject)
    })
}
const insertDataDM = (e) => {
    e.pop()
    $.confirm({
        columnClass: 'xlarge',
        title: 'Descarga archivo',
        closeIcon: true,
        content: function () {
            let self = this
            this.$$formSubmit.prop('disabled', true)
            this.$$formSubmit.html('Cargando...')
            return timeout(5000, fetch(`/api/file/${e[0].parent()[0].id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json; charset=utf-8"
                }
            })).then(async response => {
                if (response.status == 200) {
                    window.dnld = response.headers.get('downloadable')
                    window.cntnt = response.headers.get('content-type')
                    window.fileName = response.headers.get('filename')
                    window.isonMIME = supportedMIMES.includes(window.cntnt)
                    const reader = response.body.getReader();
                    try {
                        a = new Response(new ReadableStream({
                            start(controller) {
                                return pump();
                                function pump() {
                                    return reader.read().then(({ done, value }) => {
                                        if (done) {
                                            controller.close();
                                            return;
                                        }
                                        controller.enqueue(value);
                                        return pump();
                                    });
                                }
                            }
                        }));
                        a.headers.append('content-type', window.cntnt);
                        result = await a.blob()
                        window.currentBlob = result
                        var file = window.URL.createObjectURL(result.slice(0, result.size, window.cntnt));
                        if (window.isonMIME) {
                            if (window.dnld == '0') {
                                self.setContent(`<iframe style="width:100%;height:50px;" src="http://localhost:3000/noPreviewSize.html"><h1></h1></iframe><br> ${getTableData(e)[0].outerHTML}`)
                                self.$$formSubmit.prop('disabled', false)
                                self.$$formSubmit.html('Descargar')
                                return
                            }
                            if (window.cntnt.split('/')[0] == 'image')
                                self.setContent(`<div style='width: 100%; max-height: 600px; overflow: auto'><img src="${file}" alt="${file}" style='width: 100%; height: 100%; display:block'></img></div><br> ${getTableData(e)[0].outerHTML}`)
                            else {
                                self.setContent(`<iframe id="ifr" style="width:100%;height:600px;"frameborder="0" noresize  src="${file}"></iframe><br> ${getTableData(e)[0].outerHTML}`)
                            }
                        }
                        else {
                            self.setContent(`<iframe style="width:100%;height:50px;" src="http://localhost:3000/noPreview.html"><h1></h1></iframe><br> ${getTableData(e)[0].outerHTML}`)
                        }
                        self.$$formSubmit.prop('disabled', false)
                        self.$$formSubmit.html('Descargar')
                    } catch (ex) {
                        self.setContent(`<iframe style="width:100%;height:68px;" src="http://localhost:3000/noPreviewOnEdge.html"><h1></h1></iframe><br> ${getTableData(e)[0].outerHTML}`)
                        self.$$formSubmit.prop('disabled', false)
                        self.$$formSubmit.html('Descargar')
                        console.log("Constructable ReadableStream not supported");
                        return;
                    }

                } throw 'error'
            }).catch(console.log)
        },
        buttons: {
            formSubmit: {
                text: 'Descargar',
                btnClass: 'btn-blue',
                action: function () {
                    if (window.dnld != '0') {
                        console.log('dddxxx')
                        download(window.currentBlob, window.fileName, "application/octet-stream")
                    }
                    else
                        window.location = `/api/file/${e[0].parent()[0].id}/force`
                }
            },
            cancelar: function () {
                //close
            }
        },
        onContentReady: function () {
        }
    })
}
const getTableData = info => {
    colNames = ['Nombre', 'Tipo', 'Tamaño', 'Última modificación']
    data = info.reduce((z, e, i) => z + '<tr><td style="width: 200px; background-color: #f9f9f9">' + colNames[i] + ':' + '</td><td>' + (i == 0 ? e.closest_descendent('p')[0].innerHTML : e.html()) + '</td></tr>', "")
    return $("<div style='margin-left: 5%; max-width: 90%; border-style: solid; border-width: 1px;'/>").append($('<table class="table table-bordered" style="max-width: 100%; margin-bottom: 0; "/>').append(data)[0])
}
$('document').ready(() => {
    if (!JSON.parse(localStorage.getItem('org')))
        goToStart()
    removeHash()
    updateTableListenerd()
    window.t = $('#tableReview').DataTable({
        fixedHeader: {
            header: true,
            footer: true
        },
        columnDefs: [
            { "orderable": false, "targets": 4 },
            { type: 'file-size', targets: 2 },
            { targets: [1], orderData: [1, 0] }
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
                        dateCreation,
                    e.name == '..Atrás' ? "<span  style='margin-left:calc(50% - 20px); color: #000000' >––</span>" : `<div style='width: 100%; text-align:center;'><button class='btn btn-info btn-xs' onclick='editRow($(this))'>Editar</button> <button style='margin-left:5px' class='btn btn-danger btn-xs' onclick='deleteRow($(this))'>Excluir</button></div>`,
                    e._id]
                })
            }
        },
        "pageLength": 50,
        "fnCreatedRow": function (nRow, aData, iDataIndex) {
            $(nRow).attr('id', aData[5]);
        },
        'initComplete': () => {
            $('.loader-wraper').fadeOut()
            //updateHistory('root')
            updateTableListener()
        },
        order: [[1, "asc"]]
    });
    $("#formData").submit(function (e) {
        e.preventDefault();
        browserName = getBrowserName()
        if(browserName=='Edge'){
            return $.alert({
                type: 'red',
                title: 'Alerta',
                content: 'Este navegador no soporta esta función! Use Firefox o Chrome!'
            })
        }
        $('#submitForm').prop('disabled', true)
        prepareData(true, () => {
            var formData = new FormData(this);
            $.ajax({
                xhr: function () {
                    var xhr = new window.XMLHttpRequest();

                    xhr.upload.addEventListener("progress", function (evt) {
                        if (evt.lengthComputable) {
                            var percentComplete = evt.loaded / evt.total;
                            percentComplete = parseInt(percentComplete * 100) + '%'
                            $('.bar').width(percentComplete);
                            $('.bar').html(percentComplete);
                        }
                    }, false);

                    return xhr;
                },
                type: "POST",
                url: `/api/file/upload/${currentFolder}`,
                data: formData,
                processData: false,
                contentType: false,
                success: function (xhr) {
                    if (xhr == 'OK') {
                        if (rejectedConflicts.length) {
                            fetch(`/api/file/delete/`, {
                                method: 'POST',
                                headers: {
                                    'Content-type': 'Application/json'
                                },
                                body: JSON.stringify({ ids: $files.filter(e => !rejectedConflicts.some(r => r == e)).map(e => Array.from(t.rows().data()).find(x => x[0].split('\">')[3].split("<")[0] == e.name)[5]) })
                            }).then(res => {
                                if (res.status == 200) {
                                    $('#status').html('Los datos se han cargado!');
                                    t.ajax.url(`/api/folder/${currentFolder}/all`).load(updateTableListener)
                                    setTimeout(() => { getTimeout(window.timouthsdiv)(); clearTimeout(window.timouthsdiv) }, 4000)
                                }
                            })
                        }
                        else {
                            $('#status').html('Los datos se han cargado!');
                            t.ajax.url(`/api/folder/${currentFolder}/all`).load(updateTableListener)
                            setTimeout(() => { getTimeout(window.timouthsdiv)(); clearTimeout(window.timouthsdiv) }, 4000)
                        }
                        $('#submitForm').prop('disabled', false)
                        return
                    }
                    $('#submitForm').prop('disabled', false)
                    throw 'error'
                },
                error: function (e) {
                    $('#status').html('Ha ocurrido un error :(');
                    setTimeout(() => { getTimeout(window.timouthsdiv)(); clearTimeout(window.timouthsdiv) }, 4000)
                },
                beforeSend: () => hotsnackbar('', '', 100000, $(`<div style='width: 500px; '><div style='margin-bottom: 0;' class="progress">
                <div style='color: white; background-color:green; height: 20px; z-index: 2000; text-align: center'class="bar"></div >
            </div> <div style='color: white;' id="status">Subiendo...</div></div>`)[0])
            });
        })

    });
    updateTableListener()
    $('#tableReview_info').html(`<p style='word-wrap: break-word; word-break: normal; white-space: normal'>${$('#tableReview_info').html()}</p>`)



    $('#createFolder').click(e => {
        e.preventDefault()
        $.confirm({
            title: 'Crear nueva carpeta',
            closeIcon: true,
            content: '' +
                '<form action="" class="formName">' +
                '<div class="form-group">' +
                '<label>Digite el nombre de la carpeta</label>' +
                '<input type="text" placeholder="Nombre de carpeta" class="name form-control" required />' +
                '</div>' +
                '</form>',
            buttons: {
                formSubmit: {
                    text: 'Guardar',
                    btnClass: 'btn-blue',
                    action: function (e) {
                        this.$content.find('.name').focus(e => $(e.target).removeClass('error'))
                        if (this.$content.find('.name').val().length == 0) {
                            this.$content.find('.name').addClass('error')
                            hotsnackbar('hserror', 'el nombre no puede ser vacío!')
                            return false;
                        }
                        var name = this.$content.find('.name').val();
                        self = this
                        if (Array.from(t.rows().data())
                            .every(e => $(e[0]).closest_descendent('p')[0].innerHTML != name)) {
                                $.ajax({
                                    url: `/api/folder/${currentFolder}`,
                                    type: 'POST',
                                    data: JSON.stringify({
                                        name: name
                                    }),
                                    contentType: 'Application/json'
                                }).done(async response => {
                                    x = response
                                    date = new Date(x.date)
                                    dateCreation = `${date.getDate()} de ${monthNames[date.getMonth()]}, ${date.getFullYear()}`
                                    if (!x.message) {
                                        t.row.add([`<span style="display: inline; margin-right: 6px; vertical-align: text-bottom;"><img src="/images/048-folder.svg" style="float: inline-start; width:16px; heigth:16px;"></img><p style="display: inline-block; word-wrap: break-word; word-break: break-all; white-space: normal; margin-left: 3px">${x.name}</p></span>`, 'Carpeta', '––', dateCreation, `<div style='width: 100%; text-align:center;'><button class='btn btn-info btn-xs' onclick='editRow($(this))'>Editar</button> <button style='margin-left:5px' class='btn btn-danger btn-xs' onclick='deleteRow($(this))'>Excluir</button></div>`, x._id])
                                        t.draw(false)
                                        updateTableListener()
                                        hotsnackbar('hsdone', 'se ha creado la carpeta.')
                                        self.close()
                                        return
                                    }
                                    hotsnackbar('hserror', x.message)
                                    this.$content.find('.name').addClass('error')
                                })
                            /*fetch(`/api/folder/${currentFolder}`, {
                                method: "POST",
                                body: JSON.stringify({
                                    name: name
                                }),
                                headers: {
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json'
                                }
                            }).then(async response => {
                                x = await response.json()
                                date = new Date(x.date)
                                dateCreation = `${date.getDate()} de ${monthNames[date.getMonth()]}, ${date.getFullYear()}`
                                if (!x.message) {
                                    t.row.add([`<span style="display: inline; margin-right: 6px; vertical-align: text-bottom;"><img src="/images/048-folder.svg" style="float: inline-start; width:16px; heigth:16px;"></img><p style="display: inline-block; word-wrap: break-word; word-break: break-all; white-space: normal; margin-left: 3px">${x.name}</p></span>`, 'Carpeta', '––', dateCreation, `<div style='width: 100%; text-align:center;'><button class='btn btn-info btn-xs' onclick='editRow($(this))'>Editar</button> <button style='margin-left:5px' class='btn btn-danger btn-xs' onclick='deleteRow($(this))'>Excluir</button></div>`, x._id])/*.node().id = x._id;
                                    t.draw(false)
                                    updateTableListener()
                                    hotsnackbar('hsdone', 'se ha creado la carpeta.')
                                    self.close()
                                    return
                                }
                                hotsnackbar('hserror', x.message)
                                this.$content.find('.name').addClass('error')
                            })*/
                        }
                        else {
                            this.$content.find('.name').addClass('error')
                            hotsnackbar('hserror', 'el nombre de carpeta ya existe!')
                        }
                        return false
                    }
                },
                cancelar: function () {
                    //close
                },
            },
            onContentReady: function () {
                // bind to events
                var jc = this;
                this.$content.find('form').on('submit', function (e) {
                    // if the user submits the form by pressing enter in the field.
                    e.preventDefault();
                    jc.$$formSubmit.trigger('click'); // reference the button and click it
                });
            }
        });
        //$('#modalRow').modal()
    })

    $('#clearForm').click(e => {
        e.preventDefault()
        $('#tableDiv').html("")
        $('.box__button').css("display", "none");
        $files = []
        $label.html('<strong><u>Elige archivos</u></strong><span class="box__dragndrop"> o arrastralos aquí</span>.')
    })
    $input.on('change', function (e) {
        $files = Array.from(e.originalEvent.target.files).reduce((z, e) => ($files.some(n => n.name == e.name) || (!e.type && e.size % 4096 == 0)) ? z : z.concat(e), $files)
        showFiles($files);
    });
    if (isAdvancedUpload) {
        $("#file").hide();
        $("#noInput").show();
        $form.addClass('has-advanced-upload');
        var droppedFiles = false;

        $form.on('drag dragstart dragend dragover dragenter dragleave drop', function (e) {
            e.preventDefault();
            e.stopPropagation();
        })
            .on('dragover dragenter', function () {
                $form.addClass('is-dragover');
            })
            .on('dragleave dragend drop', function () {
                $form.removeClass('is-dragover');
            })
            .on('drop', function (e) {
                console.log(e.originalEvent.dataTransfer.files)
                $files = Array.from(e.originalEvent.dataTransfer.files).reduce((z, e) => ($files.some(n => n.name == e.name) || (!e.type && e.size % 4096 == 0)) ? z : z.concat(e), $files)
                showFiles($files);
            });

    } else {
        $("#file").show();
        $("#noInput").hide();
    }
})
