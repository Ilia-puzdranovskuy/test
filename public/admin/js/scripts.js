$('#privil-check').change(function()
      {
        if ($(this).is(':checked')) {
            $('#privil-block').css('display','block')
        }else{
            $('#privil-block').css('display','none')
        }
});

