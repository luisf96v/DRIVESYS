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
const getBrowserName = () => {
    var geckobrowsers;
    var browser = "";
    var browserVersion = 0;
    var agent = navigator.userAgent + " ";
    if (agent.substring(agent.indexOf("Mozilla/") + 8, agent.indexOf(" ")) == "5.0" && agent.indexOf("like Gecko") != -1) {
        geckobrowsers = agent.substring(agent.indexOf("like Gecko") + 10).substring(agent.substring(agent.indexOf("like Gecko") + 10).indexOf(") ") + 2).replace("LG Browser", "LGBrowser").replace("360SE", "360SE/");
        for (i = 0; i < 1; i++) {
            geckobrowsers = geckobrowsers.replace(geckobrowsers.substring(geckobrowsers.indexOf("("), geckobrowsers.indexOf(")") + 1), "");
        }
        geckobrowsers = geckobrowsers.split(" ");
        for (i = 0; i < geckobrowsers.length; i++) {
            if (geckobrowsers[i].indexOf("/") == -1) geckobrowsers[i] = "Chrome";
            if (geckobrowsers[i].indexOf("/") != -1) geckobrowsers[i] = geckobrowsers[i].substring(0, geckobrowsers[i].indexOf("/"));
        }
        if (geckobrowsers.length < 4) {
            browser = geckobrowsers[0];
        } else {
            for (i = 0; i < geckobrowsers.length; i++) {
                if (geckobrowsers[i].indexOf("Chrome") == -1 && geckobrowsers[i].indexOf("Safari") == -1 && geckobrowsers[i].indexOf("Mobile") == -1 && geckobrowsers[i].indexOf("Version") == -1) browser = geckobrowsers[i];
            }
        }
        browserVersion = agent.substring(agent.indexOf(browser) + browser.length + 1, agent.indexOf(browser) + browser.length + 1 + agent.substring(agent.indexOf(browser) + browser.length + 1).indexOf(" "));
    } else if (agent.substring(agent.indexOf("Mozilla/") + 8, agent.indexOf(" ")) == "5.0" && agent.indexOf("Gecko/") != -1) {
        browser = agent.substring(agent.substring(agent.indexOf("Gecko/") + 6).indexOf(" ") + agent.indexOf("Gecko/") + 6).substring(0, agent.substring(agent.substring(agent.indexOf("Gecko/") + 6).indexOf(" ") + agent.indexOf("Gecko/") + 6).indexOf("/"));
        browserVersion = agent.substring(agent.indexOf(browser) + browser.length + 1, agent.indexOf(browser) + browser.length + 1 + agent.substring(agent.indexOf(browser) + browser.length + 1).indexOf(" "));
    } else if (agent.substring(agent.indexOf("Mozilla/") + 8, agent.indexOf(" ")) == "5.0" && agent.indexOf("Clecko/") != -1) {
        browser = agent.substring(agent.substring(agent.indexOf("Clecko/") + 7).indexOf(" ") + agent.indexOf("Clecko/") + 7).substring(0, agent.substring(agent.substring(agent.indexOf("Clecko/") + 7).indexOf(" ") + agent.indexOf("Clecko/") + 7).indexOf("/"));
        browserVersion = agent.substring(agent.indexOf(browser) + browser.length + 1, agent.indexOf(browser) + browser.length + 1 + agent.substring(agent.indexOf(browser) + browser.length + 1).indexOf(" "));
    } else if (agent.substring(agent.indexOf("Mozilla/") + 8, agent.indexOf(" ")) == "5.0") {
        browser = agent.substring(agent.indexOf("(") + 1, agent.indexOf(";"));
        browserVersion = agent.substring(agent.indexOf(browser) + browser.length + 1, agent.indexOf(browser) + browser.length + 1 + agent.substring(agent.indexOf(browser) + browser.length + 1).indexOf(" "));
    } else if (agent.substring(agent.indexOf("Mozilla/") + 8, agent.indexOf(" ")) == "4.0" && agent.indexOf(")") + 1 == agent.length - 1) {
        browser = agent.substring(agent.indexOf("(") + 1, agent.indexOf(")")).split("; ")[agent.substring(agent.indexOf("(") + 1, agent.indexOf(")")).split("; ").length - 1];
    } else if (agent.substring(agent.indexOf("Mozilla/") + 8, agent.indexOf(" ")) == "4.0" && agent.indexOf(")") + 1 != agent.length - 1) {
        if (agent.substring(agent.indexOf(") ") + 2).indexOf("/") != -1) browser = agent.substring(agent.indexOf(") ") + 2, agent.indexOf(") ") + 2 + agent.substring(agent.indexOf(") ") + 2).indexOf("/"));
        if (agent.substring(agent.indexOf(") ") + 2).indexOf("/") == -1) browser = agent.substring(agent.indexOf(") ") + 2, agent.indexOf(") ") + 2 + agent.substring(agent.indexOf(") ") + 2).indexOf(" "));
        browserVersion = agent.substring(agent.indexOf(browser) + browser.length + 1, agent.indexOf(browser) + browser.length + 1 + agent.substring(agent.indexOf(browser) + browser.length + 1).indexOf(" "));
    } else if (agent.substring(0, 6) == "Opera/") {
        browser = "Opera";
        browserVersion = agent.substring(agent.indexOf(browser) + browser.length + 1, agent.indexOf(browser) + browser.length + 1 + agent.substring(agent.indexOf(browser) + browser.length + 1).indexOf(" "));
        if (agent.substring(agent.indexOf("(") + 1).indexOf(";") != -1) os = agent.substring(agent.indexOf("(") + 1, agent.indexOf("(") + 1 + agent.substring(agent.indexOf("(") + 1).indexOf(";"));
        if (agent.substring(agent.indexOf("(") + 1).indexOf(";") == -1) os = agent.substring(agent.indexOf("(") + 1, agent.indexOf("(") + 1 + agent.substring(agent.indexOf("(") + 1).indexOf(")"));
    } else if (agent.substring(0, agent.indexOf("/")) != "Mozilla" && agent.substring(0, agent.indexOf("/")) != "Opera") {
        browser = agent.substring(0, agent.indexOf("/"));
        browserVersion = agent.substring(agent.indexOf(browser) + browser.length + 1, agent.indexOf(browser) + browser.length + 1 + agent.substring(agent.indexOf(browser) + browser.length + 1).indexOf(" "));
    } else {
        browser = agent;
    }
    return browser.trim()
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
    firstOne = true
}
const updateFolderListener = () => $('.folder').mouseenter(e =>$(e.currentTarget).closest_descendent('img').attr('src', `data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!-- Generated by IcoMoon.io --%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23000000' d='M13 15l3-8h-13l-3 8zM2 6l-2 9v-13h4.5l2 2h6.5v2z'%3E%3C/path%3E%3C/svg%3E%0A`))
.mouseleave(e=>$(e.currentTarget).closest_descendent('p')[0].innerHTML=='..Atrás'?$(e.currentTarget).closest_descendent('img').attr('src', `data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!-- Generated by IcoMoon.io --%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23000000' d='M9 4l-2-2h-7v13h16v-11h-7zM8 7.5l3.5 3.5h-2.5v4h-2v-4h-2.5l3.5-3.5z'%3E%3C/path%3E%3C/svg%3E%0A`):$(e.currentTarget).closest_descendent('img').attr('src', `data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!-- Generated by IcoMoon.io --%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23000000' d='M7 2l2 2h7v11h-16v-13z'%3E%3C/path%3E%3C/svg%3E%0A`))

const insertDataDM = async e => {
    e.pop()
    $('#tableReview').css({'pointer-events': 'none'})
    $('body').css({'cursor':'progress'})
    response = await fetch(`/api/file/${e[0].parent()[0].id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        }
    })
    let content = 'no content'
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
                console.log(e[0].closest('tr'))
                if(!getBrowserName()){
                    content = `<iframe style="width:100%;height:98px;" src="/noPreviewAvailable.html"><h1></h1></iframe><br> ${getTableData(t.data().toArray().find(x=>x.indexOf(e[0].closest('tr')[0].id)!=-1))[0].outerHTML}`
                }
                else
                if (window.isonMIME) {
                    if (window.dnld == '0') {
                        content = `<iframe style="width:100%;height:50px;" src="/noPreviewSize.html"><h1></h1></iframe><br> ${getTableData(t.data().toArray().find(x=>x.indexOf(e[0].closest('tr')[0].id)!=-1))[0].outerHTML}`
                    }else
                    if (window.cntnt.split('/')[0] == 'image'){
                        content = `<div id='ifr'style='width: 100%;'><div style='max-height: 100%; overflow: auto'><img src="${file}" alt="${file}" style='width: 100%; height: 100%; display:block'></img></div></div><br> ${getTableData(e)[0].outerHTML}`
                    }
                    else {
                        content = `<iframe id="ifr" style="width:100%;" frameborder="0" noresize  src="${file}"></iframe><br> ${getTableData(t.data().toArray().find(x=>x.indexOf(e[0].closest('tr')[0].id)!=-1))[0].outerHTML}</div>`
                    }
                }
                else {
                    content = `<iframe style="width:100%;height:50px;" src="/noPreview.html"><h1></h1></iframe><br> ${getTableData(t.data().toArray().find(x=>x.indexOf(e[0].closest('tr')[0].id)!=-1))[0].outerHTML}`
                }
                
            } catch (ex) {
                console.log(ex)
                content = `<iframe style="width:100%;height:68px;" src="/noPreviewOnEdge.html"><h1></h1></iframe><br> ${getTableData(t.data().toArray().find(x=>x.indexOf(e[0].closest('tr')[0].id)!=-1))[0].outerHTML}`
                console.log("Constructable ReadableStream not supported");
            }
            
    }
    $.confirm({
        columnClass: 'xlarge',
        title: 'Descarga archivo',
        closeIcon: true,
        watchInterval: 20,
        content: content,
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
            console.log($(window).height()-$('#ifr').height()+$('#tableR').height(), $('#ifr').height()+$('#TableR').height(), $('#ifr').height())
            $('#ifr').parent().parent().parent()[0].style.cssText = $('#ifr').parent().parent().parent()[0].style.cssText + `height:  ${$('#ifr').height()>150?$('#ifr').height()+$('#TableR').height()<$(window).height()?$('#ifr').height()+$('#TableR').height():$(window).height()-($(window).height()-$('#ifr').height()+$('#TableR').height()>0?$(window).height()-$('#ifr').height()+$('#TableR').height():240):$(window).height()}px !important;`
            $('#ifr').css({height: `${$($('.jconfirm-content-pane')[0]).height()-($('#TableR').height()+30)}px`})
        }
    })
    $('#tableReview').css({'pointer-events': 'all'})
    $('body').css({'cursor': 'default'})
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