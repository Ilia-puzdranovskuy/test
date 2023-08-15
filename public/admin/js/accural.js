let numPRub = document.getElementById('numPRub');
let trifRub = document.getElementById('tarifRub');
let sumRub = document.getElementById('sumRub');


function sumRubish(){
    sumRub.value = Number(Number(numPRub.value)*Number(trifRub.value))
}
sumRubish()