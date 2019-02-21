(function ($) {
    'use strict';
    $(document).ready(function () {
        var container = $('#audioModal');

        $('#circle4').on('click', '#carga_audio', function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            $.ajax({
                url: e.currentTarget.attributes.href.value,
                type: 'GET',
                success: function(result) {
                    $.when(container.html(result)).then(function(){
                        var modal_audio = $('#crearModal');

                        $('#form-audio').validate({
                            errorClass: "text-warning",
                            onfocusout: false,
                            invalidHandler: function (e, validator) {
                                if (validator.errorList.length > 0) {
                                    validator.errorList[0].element.focus();
                                    validator.showErrors();
                                }
                            },
                            submitHandler: function () {

                                var fd = new FormData();
                                var files = $('#audio')[0].files[0];

                                fd.append('audio', files);
                                fd.append('nombre', $('#nombre').val());
                                fd.append('email', $('#email').val());
                                fd.append('observacion', $('#observacion').val());

                                $.ajax({
                                    url: e.currentTarget.attributes.href.value,
                                    cache: false,
                                    contentType: false,
                                    processData: false,
                                    method: 'POST',
                                    type: 'POST',
                                    data: fd,
                                    success: function(result) {
                                        container.find('.modal-dialog').removeClass('modal-lg');
                                        container.find('.modal-body').html('<div class="alert alert-success">'+result.message+'</div>');
                                        container.find('#cancelar').html('Cerrar');
                                        container.find('#crearaudio').hide('slow');
                                        container.find('#crearaudio').prop('disabled', true);
                                    },
                                    error: function(result) {
                                        container.find('.error_server').hide('slow').remove();
                                        container.find('.modal-body').append('<div class="alert alert-danger error_server">'+result.responseJSON.error+'</div>');
                                        container.find('#crearaudio').prop('disabled', false);
                                    }
                                });

                            }
                        });

                        modal_audio.modal('show', true);
                    });
                }
            });

        });



    })
})(window.jQuery);
