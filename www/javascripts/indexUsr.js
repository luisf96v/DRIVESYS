$(document).ready(function(){

    $(".filter-button").click(function(){
        var value = $(this).attr('data-filter');
        
        if(value == "all")
        {
            //$('.filter').removeClass('hidden');
            $('.filter').show('1000');
        }
        else
        {
//            $('.filter[filter-item="'+value+'"]').removeClass('hidden');
//            $(".filter").not('.filter[filter-item="'+value+'"]').addClass('hidden');
            $(".filter").not('.'+value).hide('1900');
            $('.filter').filter('.'+value).show('2000');
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

    $("#panel2").click(function () {
        $("#arow2").toggleClass("fa-chevron-left").toggleClass("fa-chevron-down");
    });

    $("#panel3").click(function () {
        $("#arow3").toggleClass("fa-chevron-left").toggleClass("fa-chevron-down");
    });

    $("#panel4").click(function () {
        $("#arow4").toggleClass("fa-chevron-left").toggleClass("fa-chevron-down");
    });

    $("#panel5").click(function () {
        $("#arow5").toggleClass("fa-chevron-left").toggleClass("fa-chevron-down");
    });

    $("#panel6").click(function () {
        $("#arow6").toggleClass("fa-chevron-left").toggleClass("fa-chevron-down");
    });

    $("#panel7").click(function () {
        $("#arow7").toggleClass("fa-chevron-left").toggleClass("fa-chevron-down");
    });

    $("#panel8").click(function () {
        $("#arow8").toggleClass("fa-chevron-left").toggleClass("fa-chevron-down");
    });

    $("#panel9").click(function () {
        $("#arow9").toggleClass("fa-chevron-left").toggleClass("fa-chevron-down");
    });

    $("#panel10").click(function () {
        $("#arow10").toggleClass("fa-chevron-left").toggleClass("fa-chevron-down");
    });

    $("#panel11").click(function () {
        $("#arow11").toggleClass("fa-chevron-left").toggleClass("fa-chevron-down");
    });

    $("#menu-icon").click(function (e) {
        e.stopPropagation();
        $("#chang-menu-icon").toggleClass("fa-bars").toggleClass("fa-times");
        if(!$('#mnvar').hasClass('collapsed'))
            {$("#show-nav").css('margin-top','50px')}
        else
            {$("#show-nav").css('margin-top','0px')}
        $("#show-nav").toggleClass("hide-sidebar").toggleClass("left-sidebar");
        
        //$("#left-container").toggleClass("less-width");
        //$("#right-container").toggleClass("full-width");
    });
    $('body').click(e=>{
        element =$("#show-nav")[0]
        if(element!=e.target&&!element.contains(e.target)&&$("#show-nav").hasClass("left-sidebar")){
            $("#chang-menu-icon").toggleClass("fa-bars").toggleClass("fa-times");
            $("#show-nav").toggleClass("hide-sidebar").toggleClass("left-sidebar");
        }
    })
    
    if ($(".filter-button").removeClass("active")) {
$(this).removeClass("active");
}
$(this).addClass("active");

});