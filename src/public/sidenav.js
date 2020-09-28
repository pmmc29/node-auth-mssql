document.addEventListener('DOMContentLoaded', function () {
    var sidenav = document.querySelectorAll('.sidenav');
    var sideInstance = M.Sidenav.init(sidenav);

    var collapsible = document.querySelectorAll('.collapsible');
    var collInstance = M.Collapsible.init(collapsible);

    var photo = document.querySelectorAll('.materialboxed');
    var photoInstance = M.Materialbox.init(photo);

    var select = document.querySelectorAll('select');
    var selectInstances = M.FormSelect.init(select);
});