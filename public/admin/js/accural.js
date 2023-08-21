let numPRub = document.getElementById('numPRub');
let trifRub = document.getElementById('tarifRub');
let sumRub = document.getElementById('sumRub');


function sumRubish(){
    sumRub.value = Number(Number(numPRub.value)*Number(trifRub.value))
}
sumRubish()
let spohDr = document.getElementById('spohDr');
let tafrifDr = document.getElementById('tafrifDr');
let sumDrin = document.getElementById('sumDrin');

function sumDr(){
    sumDrin.value = Number(Number(tafrifDr.value)*Number(spohDr .value))
}


let newReadInputs = document.querySelectorAll('.newRead');

newReadInputs.forEach(el => el.addEventListener('change', event => {
    let techilder = $(event.target).parent().parent()
    let tarif = techilder.children('td:nth-child(7)').children('input').val()
    let newRed = techilder.children('td:nth-child(10)').children('input').val()
    let lastRed = techilder.children('td:nth-child(8)').children('input').val()
    techilder.children('td:nth-child(11)').children('input').val(Number(newRed)-Number(lastRed))
    techilder.children('td:nth-child(12)').children('input').val((Number(newRed)-Number(lastRed))*Number(tarif))
    
    console.log( );
  }));