var prev_id = 0;
var timouthsdiv = 0;
var hstimout = 7000;
var signtext = {
    hsdone: '<span style="font-size:11px" class="icon-checkmark"></span>',
    hswarning: '<span style="font-size:11px" class="icon-warning"></span>',
    hserror: '<span style="font-size:11px" class="icon-cross"></span>',
    hsheart: '<span style="font-size:11px" class="icon-heart"></span>',
    hssad: '<span style="font-size:11px" class="icon-sad"></span>'
};

function removehs(random_idx, prev_idx, signx, textx, time, element) {

    clearTimeout(timouthsdiv);
    document.getElementById(prev_idx).className += " hsdivhide";
    prev_id = 0;
    makehs(random_idx, signx, textx, time, element);

}

function makehs(random_idx, signx, textx, time, element) {

    var hsdiv = document.createElement('div');
    $(hsdiv).css({'z-index': '2000','text-align':'center'})
    var signdiv = document.createElement('span');
    if (signx) {
        // alert(sign);
        signdiv.className = signx;
        signdiv.innerHTML = signtext[signx];
    }
    hsdiv.appendChild(element?$('<div></div>')[0]:signdiv);

    var hstext = document.createElement('span');
    hstext.className = 'hstext';
    hstext.innerHTML = textx;
    hsdiv.appendChild(element||hstext);

    hsdiv.id = random_idx;
    hsdiv.className = 'hsdivinit';


    document.getElementsByTagName('body')[0].appendChild(hsdiv);
    var currenths = document.getElementById(random_idx);
    currenths.className += " hsdivshow";
    prev_id = random_idx;
    window.timouthsdiv = setTimeout(function () {
        currenths.className += " hsdivhide";
        prev_id = 0;
        $("div").remove(".hsdivinit");
    }, time||hstimout);

}



function hotsnackbar(sign, text, time, element) {

    random_id = Math.random();
    if (prev_id) {

        removehs(random_id, prev_id, sign, text, time, element);

    } else {

        makehs(random_id, sign, text, time, element);
    }
}