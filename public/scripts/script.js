var btn = $('#button');
$(window).scroll(function() {
  if ($(window).scrollTop() > 300) {
    btn.addClass('show');
  } else {
    btn.removeClass('show');
  }
});

btn.on('click', function(e) {
  e.preventDefault();
  $('html, body').animate({scrollTop:0}, '100');
});


function pretext(){
  if(document.getElementById("phone").value.length<8){
     document.getElementById("phone").value = "+380";
  }
}

if(document.getElementById("singin-form")!=null){
  document.getElementById("singin-form").addEventListener("submit",function(evt){
            
    var response = grecaptcha.getResponse();
    if(response.length == 0) 
    { 
      document.getElementById("singin-eror").innerHTML = "Помилка проходження reCAPCHA!"
        evt.preventDefault();
        return false;
    }
    });
}


  function comparePwd() { 
    let p1 = document.getElementById("passw1");
    let p2 = document.getElementById("passw2");
    let er = document.getElementById("singin-eror");
    if (p1.value && p2.value) {
    if (p1.value != p2.value) {
      er.innerHTML ="Паролі не співпадають"
       return false
       e.preventDefault()

    } else {
      return true;
    }
} else {
  er.innerHTML ="Паролі не співпадають";
  return false
  e.preventDefault()
}
}