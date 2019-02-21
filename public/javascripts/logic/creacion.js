(function ($) {
    'use strict';
    $(document).ready(function () {
        const options = { currencySymbol: '$', decimalCharacter: ',', digitGroupSeparator: '.', decimalPlaces: 0, minimumValue: 0 }, subcarpeta = '/concursos/';
        var vfips = new AutoNumeric('#valor', options);
        var form = $('#crearModal'), container = $('#containerModal'), urlevento = $('#url_evento');

        $('input[name="fecha"]').daterangepicker({
            timePicker: true,
            startDate: moment().startOf('hour'),
            endDate: moment().startOf('hour').add(24, 'hour'),
            opens: "center",
            locale: {
                "format": 'DD/MM/YYYY hh:mm A',
                "cancelLabel": 'Cancelar',
                "applyLabel": 'Aplicar',
                "fromLabel": "Desde",
                "toLabel": "Hasta",
                "customRangeLabel": "Personalizado",
                "weekLabel": "S",
                "daysOfWeek": [
                    "Do",
                    "Lu",
                    "Ma",
                    "Mi",
                    "Ju",
                    "Vi",
                    "Sa"
                ],
                "monthNames": [
                    "Enero",
                    "Febrero",
                    "Marzo",
                    "Abril",
                    "Mayo",
                    "Junio",
                    "Julio",
                    "Agosto",
                    "Septiembre",
                    "Octubre",
                    "Noviembre",
                    "Deciembre"
                ],
                "firstDay": 1
            }
        });

        $('.daterangepicker').appendTo('#modal-content');

        $('#url').html(window.location.origin + subcarpeta);

        urlevento.titleSeoUrl({
            domain: window.location.origin,
            subdir: subcarpeta,
            format: '',
            urlbox: '#url',
            max: '30'
        });

        // Objeto Validador
        $('#form-create').validate({
            errorClass: "text-warning",
            onfocusout: false,
            invalidHandler: function (e, validator) {
                if (validator.errorList.length > 0) {
                    validator.errorList[0].element.focus();
                    validator.showErrors();
                }
            },
            submitHandler: function() {
                var drp = $('input[name="fecha"]').data('daterangepicker');

                var fd = new FormData();
                var files = $('#imagen')[0].files[0];

                fd.append('imagen', files);
                fd.append('nombre', $('#name').val());
                fd.append('url_evento', $('#url_evento').val());
                fd.append('url_total', $('#url').text());
                fd.append('valor', vfips.getFormatted());
                fd.append('guion', $('#guion').val());
                fd.append('recomendaciones', $('#recomendaciones').val());
                fd.append('finicio', drp.startDate.toISOString());
                fd.append('ffinal', drp.endDate.toISOString());

                $.ajax({
                    url: window.location.origin + '/concurso/crear',
                    cache: false,
                    contentType: false,
                    processData: false,
                    method: 'POST',
                    type: 'POST',
                    data: fd,
                    success: function(result) {
                        $('#concursos').DataTable().ajax.reload();
                        container.find('.modal-dialog').removeClass('modal-lg');
                        container.find('.modal-body').html('<div class="alert alert-success">'+result.message+'</div>');
                        container.find('#cancelar').html('Cerrar');
                        container.find('#crearevento').hide('slow');
                        container.find('#crearevento').prop('disabled', true);
                    },
                    error: function(result) {
                        container.find('.error_server').hide('slow').remove();
                        container.find('.modal-body').append('<div class="alert alert-danger error_server">'+result.responseJSON.error+'</div>');
                        container.find('#crearevento').prop('disabled', false);
                    }
                });
            }
        });

    });
})(window.jQuery);
