const logout = () => {
    fetch(`./api/user/auth/logout`,{
        method:'GET',
        credentials: "include"
    }).then(()=>{
        localStorage.removeItem('org')
        localStorage.removeItem('user')
        setTimeout(()=>window.location.reload(),1)
    })
}
const goToDump = () => {
    $('.loader-wraper').fadeIn(100)
    setTimeout(() => document.location.href = '/dumpRoot', 250)
}
const goToUsr = () => {
    $('.loader-wraper').fadeIn(100)
    setTimeout(() => document.location.href = '/adminUser', 250)
}
const goToStart = () => {
    $('.loader-wraper').fadeIn(100)
    setTimeout(() => document.location.href = '/', 250)
}
$(document).ready(function () {

    $('.orgName').html(JSON.parse(localStorage.getItem('org')).name)
    $("#usrName").html(`${getUserType(JSON.parse(localStorage.getItem('user')).type)} <b>${JSON.parse(localStorage.getItem('user')).name}</b>`)
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
    $('.button-left').click(function () {
        $('.sidebar').toggleClass('fliph');
    });
    $("#panel1").click(function () {
        $("#arow1").toggleClass("fa-chevron-left").toggleClass("fa-chevron-down");
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