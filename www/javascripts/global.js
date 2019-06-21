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