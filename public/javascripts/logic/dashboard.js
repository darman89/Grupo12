(function ($) {
    'use strict';
    $(document).ready(function () {
        var container = $('#containerModal');
        var table = $('#concursos').DataTable({
            ajax: {
                url: '/concurso/list',
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
                {data: 'f4'},
                {data: 'f5'}
            ],
            dom: "<'row'<'col-sm-12 col-md-12 text-center py-4'B>><'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'f>>" +
                "<'row'<'col-sm-12'tr>>" +
                "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
            language: {
                loadingRecords: 'Cargando...',
                zeroRecords: 'No se encontraron resultados',
                infoFiltered: '(filtrado de un total de _MAX_ registros) ',
                lengthMenu: "Mostrar _MENU_ entradas",
                search: "Buscar:",
                infoEmpty: '0 registros. ',
                emptyTable: 'No hay concursos registrados',
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
                    'targets': [0, 4],
                    'width': "25%",
                    'searchable': true,
                    'class': "fs-13 text-left"
                },
                {
                    'targets': [1, 2, 3],
                    'width': "15%",
                    'searchable': true,
                    'class': "fs-13 text-center text-capitalize"
                },
                {
                    'targets': [5],
                    'width': "0%",
                    'searchable': false,
                    'visible': false
                }
            ],
            buttons: [
                {
                    className: 'btn oneMusic-btn btn-2 m-2',
                    text: '<span class="bold">Crear Concurso</span>',
                    action: function (e, dt) {
                        e.stopImmediatePropagation();
                        e.preventDefault();
                        table.rows('.selected').deselect();
                        $.ajax({
                            url: window.location.origin + '/dashboard/crear',
                            type: 'GET',
                            success: function (result) {
                                $.when(container.html(result)).then(function(){
                                    $('#crearModal').modal('show', true);
                                });

                            }
                        });
                    }
                },
                {
                    extend: 'selected',
                    className: 'btn oneMusic-btn btn-2 m-2',
                    text: '<span class="bold">Ver Detalles</span>',
                    action: function (e, dt) {
                        e.stopImmediatePropagation();
                        e.preventDefault();
                        var row = dt.rows({selected: true}).data()[0];
                        window.open(row.f4);

                    }
                },
                {
                    extend: 'selected',
                    className: 'btn oneMusic-btn btn-2 m-2',
                    text: '<span class="bold">Editar Concurso</span>',
                    action: function (e, dt) {
                        e.stopImmediatePropagation();
                        e.preventDefault();
                    }
                },
                {
                    extend: 'selected',
                    className: 'btn oneMusic-btn btn-2 m-2',
                    text: '<span class="bold">Eliminar Concurso</span>',
                    action: function (e, dt) {
                        e.stopImmediatePropagation();
                        e.preventDefault();
                        $.ajax({
                            url: window.location.origin + '/concurso/eliminar',
                            type: 'GET',
                            success: function(result) {
                                $.when(container.html(result)).then(function(){
                                    var row = dt.rows({selected: true}).data()[0];
                                    var modal_delete = $('#eliminarModal');
                                    var nombre_evento = $('#nombre_evento');
                                    nombre_evento.html('<strong>'+row.f0+'</strong>');
                                    modal_delete.modal('show', true);
                                });

                            }
                        });

                    }
                }
            ]
        });

        container.on('click', '#eliminar_evento', function(e){
            var row = table.rows({selected: true}).data()[0];
            container.find('#eliminar_evento').prop('disabled', true);
            $.ajax({
                url: row.f5,
                type: 'DELETE',
                success: function(result) {
                    table.ajax.reload();
                    container.find('.modal-body').html('<div class="alert alert-success">'+result.message+'</div>');
                    container.find('#cancelar').html('Cerrar');
                    container.find('#eliminar_evento').hide('slow');
                    container.find('#eliminar_evento').prop('disabled', true);
                },
                error: function(result){
                    container.find('.error_server').hide('slow').remove();
                    container.find('.modal-body').append('<div class="alert alert-danger error_server">'+result.responseJSON.error+'</div>');
                    container.find('#eliminar_evento').prop('disabled', false);
                }
            });

        });

    });
})(window.jQuery);
