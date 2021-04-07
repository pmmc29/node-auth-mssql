document.addEventListener('DOMContentLoaded', async function () {
    let apiEmp = await (await fetch('http://localhost:3000/api/getEmpresas')).json()
    let lista = {}
    apiEmp.map((e) => {
        const key = e.nom_emp
        const value = null
        lista[key] = value
    })
    console.log(lista)
    // console.log(nombresApi)
    var datos = {
        data: lista
    }
    var elems = document.querySelectorAll('.autocompleteE');
    var instance = M.Autocomplete.init(elems, datos);

});