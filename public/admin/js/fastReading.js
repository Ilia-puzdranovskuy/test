
let controller = $('#type').val();

let count = $('#count')


let tbbody = $('#tblbodyfastpay');
$(document).on("click",'.delt', function(event) {
    $(this).parents('tr').remove()
    sumAndCount()
})


function sumAndCount() {
    count.html(tbbody.children().length-1)
}




$(document).on("keydown",'.persAcNumber', function(event) {
    if(event.which == 13){
 
        let target =$(this).parents([1])
        $.post("/admin-panel-controll/reading-fast-one",
        {
          persAC:$(this).val()  
        },
        function(data, status){
            if(data.length!=0){
              console.log(data)
                    let meterList =''
                    for (let i = 0; i < data.length; i++) {
                      const element = data[i];
                      meterList+= `<option value="${element.id_meters}">Статус:${element.status} Бренд:${element.brand} 
                      С.Н.:${element.serial_number}\n ост.показ.:${element.last_readinng} дата ост.показ.:${formatDate(new Date(element.last_readinng_date))}</option>`
                    }
                    target.children('td:nth-child(3)').append('<select>'+meterList+'</select>')
                    target.children('td:nth-child(4)').html(data[0].full_name)
                    let apartment =''
                    if(data[0].apartment!=0){apartment=`/${data[0].apartment}`}
                    target.children('td:nth-child(5)').html(`${data[0].street}, ${data[0].house} ${apartment}`) 
                    target.children('td:nth-child(6)').html(data[0].settlement)
                    target.children('td:nth-child(7)').html(data[0].id_personal_account)
                    target.children('td:nth-child(8)').append('<button class="btn btn-danger delt">Del</button>')
            
                    target.children('tbody').append(`<tr>
                    <td><input type="text" class="persAcNumber"></td>
                    <td><input type="number"></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>`)
                  sumAndCount()
            }else{
                alert("Невіриний номер або користувач не має лычильників");
            }

        });
    }
     
  });

  function send() {
    sumAndCount();
    let persAcList1 =[];


    for (let i = 1; i < tbbody.children().length; i++) {
        const element = tbbody.children(`tr:nth-child(${i})`)
        let pAc ={
            'reading':element.children(`td:nth-child(2)`).children('input').val(),
            'id':element.children(`td:nth-child(7)`).html(),
            'meter':element.children(`td:nth-child(3)`).children('select').val()
        }
        persAcList1.push(pAc);
    }
    console.log(persAcList1)
    $.post("/admin-panel-controll/reading-fast-all",
    {
      perAcs:JSON.stringify(persAcList1),
      controller:$('#type').val()
    },
    function(data, status){
        console.log(data+'/'+status)
    })


    }

    function formatDate(date) {
      var d = date,
          month = '' + (d.getMonth() + 1),
          day = '' + d.getDate(),
          year = d.getFullYear();
    
      if (month.length < 2) 
          month = '0' + month;
      if (day.length < 2) 
          day = '0' + day;
    
      return [year, month, day].join('-');
    }
    