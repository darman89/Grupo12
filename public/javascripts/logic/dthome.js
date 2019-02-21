(function ($) {
    'use strict';
    $(document).ready(function () {

        var table = $('#home-concursos').DataTable({
            ajax: {
                url: 'concursos',
                dataSrc: function (json) {
                    return json;
                }
            },
            lengthMenu: [ 10, 30, 50, 75, 100 ],
            autoWidth: false,
            select: {
                info: true,
                style: 'single'
            },
            order: false,
            columns: [
                {data: 'f0'},
                {data: 'f1'},
                {data: 'f2'},
                {data: 'f3'},
                {data: 'f4'}
            ],
            dom: "<'row'<'col-sm-12 col-md-12 text-right py-4'B>><'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'f>>" +
                "<'row'<'col-sm-12'tr>>" +
                "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
            language: {
                loadingRecords: 'Cargando...',
                zeroRecords: 'No se encontraron resultados',
                infoFiltered: '(filtrado de un total de _MAX_ registros) ',
                lengthMenu: "Mostrar _MENU_ entradas",
                search: "Buscar:",
                infoEmpty: '0 registros. ',
                emptyTable: 'No hay concursos registradas en este momento',
                info: '<b>_START_ a _END_</b> de _TOTAL_ registros. ',
                "paginate": {
                    "first": "Inicio",
                    "last": "Fin",
                    "next": "Siguiente",
                    "previous": "Anterior"
                },
                select: {
                    rows: {
                        _: "",
                        1: "1 fila seleccionada"
                    }
                }
            },
            columnDefs: [
                {
                    'targets': [1, 2, 3],
                    'width': "20%",
                    'searchable': true,
                    'class': "fs-13 text-left"
                },
                {
                    'targets': [0],
                    'width': "40%",
                    'searchable': true,
                    'class': "fs-13 text-center text-capitalize"
                },
                {
                    'targets': [4],
                    'width': "0%",
                    'searchable': false,
                    'visible': false
                }
            ],
            buttons: [
                {
                    extend: 'selected',
                    className: 'btn  btn-info',
                    text: '<span class="bold">+ Información</span>',
                    action: function (e, dt) {
                        e.stopImmediatePropagation();
                        e.preventDefault();
                        var row = dt.rows({selected: true}).data()[0];
                        console.log(row)
                    }
                }
            ]
        });


    })
})(window.jQuery);
