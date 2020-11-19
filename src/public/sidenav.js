document.addEventListener('DOMContentLoaded', function () {
    var sidenav = document.querySelectorAll('.sidenav');
    var sideInstance = M.Sidenav.init(sidenav);

    var collapsible = document.querySelectorAll('.collapsible');
    var collInstance = M.Collapsible.init(collapsible);

    var photo = document.querySelectorAll('.materialboxed');
    var photoInstance = M.Materialbox.init(photo);

    var select = document.querySelectorAll('select');
    var selectInstances = M.FormSelect.init(select);

    var options= {format: 'dd/mm/yyyy',yearRange: [1950,new Date().getFullYear()],
i18n: {
    months: [
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre'
    ],
    monthsShort: [
        'Ene',
        'Feb',
        'Mar',
        'Abr',
        'May',
        'Jun',
        'Jul',
        'Ago',
        'Sep',
        'Oct',
        'Nov',
        'Dic'
    ],
    weekdays: [
        'Domingo',
        'Lunes',
        'Martes',
        'Miercoles',
        'Jueves',
        'Viernes',
        'Sabado'
    ],
    weekdaysShort: [
        'Dom',
        'Lun',
        'Mar',
        'Mie',
        'Jue',
        'Vie',
        'Sab'
    ],
    weekdaysAbbrev: ['D', 'L', 'M', 'M', 'J', 'V', 'S']
}}
    var datepicker = document.querySelectorAll('.datepicker');
    var dateInstances = M.Datepicker.init(datepicker,options);
    

    var modal = document.querySelectorAll('.modal');
    var modalInstances = M.Modal.init(modal, options);
});