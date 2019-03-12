(function ($) {
    'use strict';
    $(document).ready(function () {
        var users = $('#users_concurso');
        var container = $('#audioModalContainer');
        var table = $('#audio-concursos').DataTable({
            ajax: {
                url: $('meta[name="referer"]').attr("content"),
                dataSrc: function (json) {
                    users.html(json.length +' Participantes');
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
                {data: 'f4'},
                {data: 'f5'}
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
                emptyTable: 'No hay voces registradas en este concurso',
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
                    'targets': [1, 2],
                    'width': "30%",
                    'searchable': true,
                    'class': "fs-13 text-left"
                },
                {
                    'targets': [0, 3],
                    'width': "20%",
                    'searchable': true,
                    'class': "fs-13 text-center text-capitalize"
                },
                {
                    'targets': [4, 5],
                    'width': "0%",
                    'searchable': false,
                    'visible': false
                }
            ],
            buttons: [
                {
                    extend: 'selected',
                    className: 'btn  btn-info',
                    text: '<span class="bold">Escuchar Voz</span>',
                    action: function (e, dt) {
                        e.stopImmediatePropagation();
                        e.preventDefault();
                        var row = dt.rows({selected: true}).data()[0];
                        $.ajax({
                            url:row.f4,
                            type: 'GET',
                            success: function (result) {
                                $.when(container.html(result)).then(function(){
                                    $('#audioModal').on('hidden.bs.modal', function () {
                                        $('#audioModalContainer').html('');
                                    });

                                    if ($.fn.audioPlayer) {
                                        $('audio').audioPlayer();
                                    }
                                    $('#audioModal').modal('show');
                                });
                            }
                        });
                    }
                },
                {
                    extend: 'selected',
                    className: 'btn  btn-success',
                    text: '<span class="bold">Descargar Voz Original</span>',
                    action: function (e, dt) {
                        e.stopImmediatePropagation();
                        e.preventDefault();
                        var row = dt.rows({selected: true}).data()[0];
                        window.open(row.f5);
                    }
                }
            ]
        });


    })
})(window.jQuery);
