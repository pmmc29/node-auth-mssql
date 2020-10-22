$(document).ready(function () {
    $('#tb_asegurados').pageMe({
        pagerSelector: '#myPager',
        activeColor: 'blue',
        prevText: 'Anterior',
        nextText: 'Siguiente',
        showPrevNext: true,
        hidePageNumbers: false,
        perPage: 10
    });
    $('#tb_empresas').pageMe({
        pagerSelector: '#myPager',
        activeColor: 'blue',
        prevText: 'Anterior',
        nextText: 'Siguiente',
        showPrevNext: true,
        hidePageNumbers: false,
        perPage: 10
    });
    console.log('test')
});