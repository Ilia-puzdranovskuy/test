
function getAuditToPdf(){

    let tb =  document.getElementById('tblbody')

    let cont = [['Особ.рах','Сума','Статус','Дата','Джерело','Тип розрах.','Індифікатор','Автор']]
    for (let i = 0; i < tb.children.length; i++) {
        let row =[]
        for (let rw = 0; rw < tb.children[i].children.length; rw++) {
            row.push(tb.children[i].children[rw].textContent)
        }
        cont.push(row)
    }
    var dd = {
        content: [
          {
            layout: 'lightHorizontalLines', // optional
            table: {
              headerRows: 1,
              widths: [ 'auto','auto','auto','auto','auto','auto','auto','auto'],
              body: cont
            }
          }
          
        ],
        defaultStyle: {
            fontSize: 8,
            margin:0
          },
        pageBreakBefore: function(currentNode, followingNodesOnPage, nodesOnNextPage, previousNodesOnPage) {
            return currentNode.headlineLevel === 1 && followingNodesOnPage.length === 0;
        }
      };
      let name =  document.getElementById('nameFile').textContent
    pdfMake.createPdf(dd).download(name);
  

}





function getAuditToPdfReadings(){

    let tb =  document.getElementById('tblbody')

    let cont = [['Особ.рах','Показник','Джерело','Дата','Cкважина']]
    for (let i = 0; i < tb.children.length; i++) {
        let row =[]
        for (let rw = 0; rw < tb.children[i].children.length; rw++) {
            row.push(tb.children[i].children[rw].textContent)
        }
        cont.push(row)
    }
    var dd = {
        content: [
          {
            layout: 'lightHorizontalLines', // optional
            table: {
              headerRows: 1,
              widths: [ 'auto','auto','auto','auto','auto'],
              body: cont
            }
          }
          
        ],
        defaultStyle: {
            fontSize: 14,
            margin:0
          },
        pageBreakBefore: function(currentNode, followingNodesOnPage, nodesOnNextPage, previousNodesOnPage) {
            return currentNode.headlineLevel === 1 && followingNodesOnPage.length === 0;
        }
      };
      let name =  document.getElementById('nameFile').textContent
    pdfMake.createPdf(dd).download(name);
  

}