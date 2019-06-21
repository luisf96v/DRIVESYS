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