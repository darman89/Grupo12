(function ($) {
    'use strict';
    $(document).ready(function () {
        const options = { currencySymbol: '$', decimalCharacter: ',', digitGroupSeparator: '.', decimalPlaces: 0, minimumValue: 0 }, subcarpeta = '/concursos/';
        var vfips = new AutoNumeric('#valor', options);
        var container = $('#containerModal'), urlevento = $('#url_evento');

        $('input[name="fecha"]').daterangepicker({
            timePicker: true,
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

        urlevento.titleSeoUrl({
            domain: window.location.origin,
            subdir: subcarpeta,
            format: '',
            urlbox: '#url',
            max: '30'
        });

        // Objeto Validador
        $('#form-update').validate({
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
                var button_crear = container.find('#crearevento');

                var loadingText = '<i class="fa fa-circle-o-notch fa-spin"></i> Cargando...';
                if (button_crear.html() !== loadingText) {
                    button_crear.data('original-text', button_crear.html());
                    button_crear.html(loadingText);
                }

                button_crear.prop('disabled', true);

                $.ajax({
                    url: $('#form-update').attr('action'),
                    contentType:'application/x-www-form-urlencoded; charset=UTF-8',
                    type: 'PUT',
                    data: {nombre: $('#name').val(), finicio: drp.startDate.toISOString(), ffinal: drp.endDate.toISOString(), url_evento: $('#url_evento').val(), url_total: $('#url').text(), valor: vfips.getFormatted(), guion: $('#guion').val(), recomendaciones: $('#recomendaciones').val() },
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
