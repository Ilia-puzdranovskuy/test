
let type = $('#type').val();
let service = $('#service').val();
let way = $('#way').val();

let sum = $('#sum')
let count = $('#count')


let tbbody = $('#tblbodyfastpay');
$(document).on("click",'.delt', function(event) {
    $(this).parents('tr').remove()
    sumAndCount()
})


function sumAndCount() {
    count.html(tbbody.children().length-1)
    let allsum = 0
    for (let i = 1; i < tbbody.children().length; i++) {
        const element = tbbody.children(`tr:nth-child(${i})`)
       allsum += Number( element.children('td:nth-child(2)').children('input').val())
    }
    sum.html(allsum)
}

  $(document).on("keydown",'.inpSum', function(event) {
    if(event.which == 13){
    sumAndCount()
    }
  })


$(document).on("keydown",'.persAcNumber', function(event) {
    if(event.which == 13){
 
        let target =$(this).parents([1])
        $.post("/admin-panel-controll/payment-fast-one",
        {
          persAC:$(this).val()  
        },
        function(data, status){
            if(data.length!=0){

                if(JSON.parse(data[0].services)!=null&&JSON.parse(data[0].services).includes(service)){
                    target.children('td:nth-child(3)').html(data[0].full_name)
                    let apartment =''
                    if(data[0].apartment!=0){apartment=`/${data[0].apartment}`}
                    target.children('td:nth-child(4)').html(`${data[0].street}, ${data[0].house} ${apartment}`) 
                    target.children('td:nth-child(5)').html(data[0].settlement)
                    target.children('td:nth-child(6)').html(data[0].id_personal_account)
                    target.children('td:nth-child(7)').append('<button class="btn btn-danger delt">Del</button>')
            
                    target.children('tbody').append(`<tr>
                    <td><input type="text" class="persAcNumber"></td>
                    <td><input type="number"></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>`)
                  sumAndCount()
                }else{
                    alert(`Данний особовий рахунок не має послуги ${service}`);  
                }
            }else{
                alert("Невіриний номер");
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
            'persAc':element.children(`td:nth-child(1)`).children('input').val(),
            'sum':element.children(`td:nth-child(2)`).children('input').val(),
            'id':element.children(`td:nth-child(6)`).html(),
        }
        persAcList1.push(pAc);
    }
    console.log(persAcList1)
    $.post("/admin-panel-controll/payment-fast-all",
    {
      perAcs:JSON.stringify(persAcList1),
      type:type,
      service:service,
      way:way
    },
    function(data, status){
        console.log(data+'/'+status)
    })


    }