(function ($) {
    $.fn.closest_descendent = function (filter) {
        var $found = $(),
            $currentSet = this; // Current place
        while ($currentSet.length) {
            $found = $currentSet.filter(filter);
            if ($found.length) break;  // At least one match: break loop
            // Get all children of the current set
            $currentSet = $currentSet.children();
        }
        return $found.first(); // Return first match of the collection
    }
})(jQuery);

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
    firstOne = true
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
                                self.setContent(`<iframe style="width:100%;height:50px;" src="/noPreviewSize.html"><h1></h1></iframe><br> ${getTableData(e)[0].outerHTML}`)
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
                            self.setContent(`<iframe style="width:100%;height:50px;" src="/noPreview.html"><h1></h1></iframe><br> ${getTableData(e)[0].outerHTML}`)
                        }
                        self.$$formSubmit.prop('disabled', false)
                        self.$$formSubmit.html('Descargar')
                    } catch (ex) {
                        self.setContent(`<iframe style="width:100%;height:68px;" src="/noPreviewOnEdge.html"><h1></h1></iframe><br> ${getTableData(e)[0].outerHTML}`)
                        self.$$formSubmit.prop('disabled', false)
                        self.$$formSubmit.html('Descargar')
                        console.log("Constructable ReadableStream not supported");
                        return;
                    }

                }
            }).catch(console.log)
        },
        buttons: {
            formSubmit: {
                text: 'Descargar',
                btnClass: 'btn-blue',
                action: function () {
                    if (window.dnld != '0') {
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

const logout = () => {
    fetch(`./api/user/auth/logout`, {
        method: 'GET',
        credentials: "include"
    }).then(() => {
        localStorage.removeItem('org')
        localStorage.removeItem('user')
        removeHash()
        setTimeout(() => window.location.reload(), 1)
    })
}
const goToProfile = () =>{
    $('#profileLink').fadeOut(100)
    $('.loader-wraper').fadeIn(100)
    setTimeout(() => document.location.href = '/profile', 250)
}
const goToDump = (removeOrg) => {
    $('.loader-wraper').fadeIn(100)
    if (removeOrg)
        localStorage.removeItem('org')
    if (localStorage.getItem('org'))
        setTimeout(() => document.location.href = '/dump', 250)
    else
        setTimeout(() => document.location.href = '/dumpRoot', 250)
}
const goToUsr = () => {
    $('.loader-wraper').fadeIn(100)
    setTimeout(() => document.location.href = '/adminUser', 250)
}
const goToStart = (removeOrg) => {
    $('.loader-wraper').fadeIn(100)
    if (removeOrg)
        localStorage.removeItem('org')
    setTimeout(() => document.location.href = '/', 250)
}
$(document).ready(function () {
    if (JSON.parse(localStorage.getItem('org')))
        $('.orgName').html(JSON.parse(localStorage.getItem('org')).name)
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
})