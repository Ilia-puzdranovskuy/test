let fs = require("fs");

exports.transferPersonalAcaunts = async ()=>{
    fs.readFile('./convertedBD/Особові рахунки.json', 'utf8', async function (err, data) {
      if (err) throw err;
      obj = JSON.parse(data);
      for (let i = 0; i < obj.length; i++) {
        const element = obj[i];
        let closeDates = null;
        if(element["Дата закриття"]!=undefined){
          closeDates = formatDate(new Date(element["Дата закриття"]))
        }
        let house = element["Будинок"]
        if(element["Літера будинку"]!=undefined){
            house = element["Будинок"]+element["Літера будинку"]
    
        }
        let apartment = element["Квартира"]
        if(element["Літера квартири"]!=undefined){
            apartment = element["Квартира"]+element["Літера квартири"]
        }
        let date = formatDate(new Date(element["Дата створення"]))

        function nameRedactor (){
            if(element["Власник"]!=undefined){
                return element["Власник"].replace(/'/g, "’")
            }else{
                return ""
            }
            
        }

        let fullName =  nameRedactor()
    let sql1= "INSERT INTO personal_accounts (`id_personal_account`, `personal_account`, `full_name`, `street`, `house`, `apartment`, `settlement`, `date_of_creation`, `privilege`, `type`, `serviceProvider`) "
    let value= `VALUE ('${element["Код"]}', '${element["ОР"]}', '${fullName}', '${element["Вулиця"]}', '${house}', '${apartment}', '${element["НП"]}', '${date}', '${element["Пільга"]}', '${element["Тип"]}', '${element["Надавач послуг"]}');`

    connection.query(sql1+value, function (error, results, fields) {
        if (error) throw error;
        console.log(results[0]);

      });

  }
}); 
}

//INSERT INTO `municipal_enterprise`.`meters` (`id_meters`, `personal_account_id`, `brand`, `release_date`, `serial_number`, `date_of_last_service`, `end_of_work`) VALUES ('1', '1', '1', '2013-1-1', '1', '', '');
exports.transferMeters = async ()=>{

    let query = `SELECT id_personal_account FROM personal_accounts`;
                await connection.query(query, async(err, rows) => {
                    if (err) {
                        console.log("internal error", err);
                        return;
                    }
                   let res = JSON.parse(JSON.stringify(rows))
                   console.log(res)
                   for (let index = 0; index < res.length; index++) {
                        const element = res[index];
                        let sql2= "INSERT INTO meters (`personal_account_id`, `type`) ";
                        let value2= `VALUE ('${element.id_personal_account}', '${1}');`
                        connection.query(sql2+value2, function (error, results, fields) {
                            if (error) throw error;
                            console.log(results[0]);
                        
                         })
                    }
                });



    // fs.readFile('./convertedBD/Лічильники.json', 'utf8', async function (err, data) {
    //     if (err) throw err;
    //     obj = JSON.parse(data);

    //     for (let i = 0; i < obj.length; i++) {
    //         const element = obj[i];
            
    //         let house = element["Будинок"]
    //         if(element["Літера будинку"]!=undefined){
    //             house = element["Будинок"]+element["Літера будинку"]
        
    //         }
    //         let apartment = element["Квартира"]
    //         if(element["Літера квартири"]!=undefined){
    //             apartment = element["Квартира"]+element["Літера квартири"]
    //         }


    //         if(element["Дата випуску"] != undefined||element["Серійний №"] != undefined||element["Марка"]){
    //         let output;
  
 
    //             const setOutput = async (rows) => {
    //                 output = rows;
    //                 if(output.length>0){

                        
    //                     let type = (element["Тип"]!=undefined) ? element["Тип"] : "";
    //                     let brand = (element["Марка"]!=undefined) ? element["Марка"] : "";
    //                     let date = (element["Дата випуску"]!=undefined) ? formatDate(new Date(element["Дата випуску"])) : "";
    //                     let serialN = (element["Серійний №"]!=undefined) ? element["Серійний №"] : "";

    //                     if(house!=0 && apartment!=0){
    //                         if(output.length==1){
    //                             if(date===""){
    //                                 let sql2= "INSERT INTO meters (`personal_account_id`, `type`, `brand`, `serial_number`) ";
    //                                 let value2= `VALUE ('${output[0].id_personal_account}', '${type}', '${brand}', '${serialN}');`
    //                                 connection.query(sql2+value2, function (error, results, fields) {
    //                                     if (error) throw error;
    //                                     console.log(results[0]);
                        
    //                                 });
    //                             }else{
                                    
    //                             let sql1= "INSERT INTO meters (`personal_account_id`, `type`, `brand`, `release_date`, `serial_number`) "
    //                             let value= `VALUE ('${output[0].id_personal_account}', '${type}', '${brand}', '${date}', '${serialN}');`
    //                                 connection.query(sql1+value, function (error, results, fields) {
    //                                     if (error) throw error;
    //                                     console.log(results[0]);
                        
    //                                 });
    //                             }

    //                         }else{
    //                             if(output[1].id_personal_account == 4296){
    //                                 if(date===""){
    //                                     let sql2= "INSERT INTO meters (`personal_account_id`, `type`, `brand`, `serial_number`) ";
    //                                     let value2= `VALUE ('${output[1].id_personal_account}', '${type}', '${brand}', '${serialN}');`
    //                                     connection.query(sql2+value2, function (error, results, fields) {
    //                                         if (error) throw error;
    //                                         console.log(results[0]);
                            
    //                                     });
    //                                 }else{
                                        
    //                                 let sql1= "INSERT INTO meters (`personal_account_id`, `type`, `brand`, `release_date`, `serial_number`) "
    //                                 let value= `VALUE ('${output[1].id_personal_account}', '${type}', '${brand}', '${date}', '${serialN}');`
    //                                     connection.query(sql1+value, function (error, results, fields) {
    //                                         if (error) throw error;
    //                                         console.log(results[0]);
                            
    //                                     });
    //                                 }
    //                             }
     
    //                     }
    //                     }
    //                 }
    //             }
    //             let query = `SELECT id_personal_account FROM personal_accounts WHERE street='${element["Вулиця"]}' AND house = '${house}' AND apartment = '${apartment}' AND settlement ='${element["НП"]}' `;
    //             await connection.query(query, async(err, rows) => {
    //                 if (err) {
    //                     console.log("internal error", err);
    //                     return;
    //                 }
    //                await setOutput(JSON.parse(JSON.stringify(rows)));
    //             });

    //         }







    //     }




            

    //             // });

        
        
            


    //         // !contains(erorElements,element["Код"])
    //         // let erorElements = [1598,1850,1904,1910,4353,4363,4374,4382,4392,4456,4457,4458,4459,4468,4472,4474,4480,4495,4506,4507,4508,4509,4510,4521,4526,4547,4552,4562,
    //         //     4564,4604,4614,4632,4633,4726,4732,4733,4734,4735,4736,4737,4738,4739]
    //         // function contains(arr, elem) {
    //         //     return arr.indexOf(elem) != -1;
    //         //  
        
    // }); 
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