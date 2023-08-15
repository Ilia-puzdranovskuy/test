
const config = require('../config');

let jwt = require("jsonwebtoken");
let bcrypt = require("bcryptjs");

exports.authGet= async (req, res) => {
    let errors = '';
    res.render('admin/authPage',{errors:errors})
}


exports.authPost= async (req, res) => {
    let query = `SELECT * FROM admins_accounts
    WHERE admins_accounts.login = '${req.body.login}'`;
    
    connection.query(query, async(err, result) => {
        if (err) {
            console.log("internal error", err);
            return;
        }
        let parseResult = JSON.parse(JSON.stringify(result));
        let errors = '';
        if(parseResult.length>0){
            let passwordIsValid = bcrypt.compareSync(
                req.body.password,
                parseResult[0].password
            );
            let keyIsValid = bcrypt.compareSync(
                req.body.key,
                parseResult[0].key
            );
            if (!passwordIsValid||!keyIsValid) {
                errors="Невірні дані";
                res.render('admin/authPage',{errors:errors})
              }else{
                let token = jwt.sign({ id: parseResult[0].id_admins_accounts, name:parseResult[0].name}, config.admin_secret, {
                    expiresIn: 86400*9000 // 24 hours
                  });
                  res.cookie('admintoken', token, { maxAge: 86400*9000 });
                  res.redirect("/admin-panel-controll/main")
              }
        }else{
            errors="Невірні дані";
            res.render('admin/authPage',{errors:errors})
        }
    });
    
}

//// MAIN PAGE AND SERCH
exports.mainPage= async (req, res) => {
    if(isAuth(req,res)){
        return
    }
    let errors='';
    let personalAccounts = [];
    res.render('admin/main',{errors:errors,personalAccounts:personalAccounts})
}


exports.searchPersAc= async (req, res) => {
    if(isAuth(req,res)){
        return
    }
    let errors='';
    if(req.body.searchOption==='persAcNum'){
        let query = `SELECT * FROM personal_accounts
        WHERE personal_accounts.personal_account = '${req.body.searchText}'`;
        connection.query(query, async(err, result) => {
            if (err) {
                console.log("internal error", err);
                return;
            }
            
            let parseResult = JSON.parse(JSON.stringify(result));
            if(parseResult!=null&&parseResult.length==0){
                errors = `Особового рахунку ${req.body.searchText} не знайдено!`
               return res.render('admin/main',{errors:errors,personalAccounts:parseResult})
            }
            res.render('admin/main',{errors:errors,personalAccounts:parseResult})
        }) 
    }

    if(req.body.searchOption==='fullName'){
        let query = `SELECT * FROM personal_accounts
        WHERE personal_accounts.full_name = '${req.body.searchText}'`;
        connection.query(query, async(err, result) => {
            if (err) {
                console.log("internal error", err);
                return;
            }
            
            let parseResult = JSON.parse(JSON.stringify(result));
            if(parseResult!=null&&parseResult.length==0){
                errors = `Особових рахунку за власником ${req.body.searchText} не знайдено!`
               return res.render('admin/main',{errors:errors,personalAccounts:parseResult})
            }
            res.render('admin/main',{errors:errors,personalAccounts:parseResult})
        }) 
    }


    if(req.body.searchOption==='settlement'){
        let query = `SELECT * FROM personal_accounts
        WHERE personal_accounts.settlement = '${req.body.searchText}'`;
        connection.query(query, async(err, result) => {
            if (err) {
                console.log("internal error", err);
                return;
            }
            
            let parseResult = JSON.parse(JSON.stringify(result));
            if(parseResult!=null&&parseResult.length==0){
                errors = `Особових рахунку за населеним пунктом ${req.body.searchText} не знайдено!`
               return res.render('admin/main',{errors:errors,personalAccounts:parseResult})
            }
            res.render('admin/main',{errors:errors,personalAccounts:parseResult})
        }) 
    }
    if(req.body.searchOption==='street'){
        let query = `SELECT * FROM personal_accounts
        WHERE personal_accounts.street = '${req.body.searchText}'`;
        connection.query(query, async(err, result) => {
            if (err) {
                console.log("internal error", err);
                return;
            }
            
            let parseResult = JSON.parse(JSON.stringify(result));
            if(parseResult!=null&&parseResult.length==0){
                errors = `Особового рахунку за вулицьою ${req.body.searchText} не знайдено!`
               return res.render('admin/main',{errors:errors,personalAccounts:parseResult})
            }
            res.render('admin/main',{errors:errors,personalAccounts:parseResult})
        }) 
    }

    if(req.body.searchOption==='debt'){
        let query = `SELECT * FROM personal_accounts
        WHERE personal_accounts.balance < 0`;
        connection.query(query, async(err, result) => {
            if (err) {
                console.log("internal error", err);
                return;
            }
            
            let parseResult = JSON.parse(JSON.stringify(result));
            if(parseResult!=null&&parseResult.length==0){
                errors = `Особового рахунків з заборгованістю не знайдено!`
               return res.render('admin/main',{errors:errors,personalAccounts:parseResult})
            }
            res.render('admin/main',{errors:errors,personalAccounts:parseResult})
        }) 
    }
}

//  READINGS 

exports.readings = async (req, res) => {
    if(isAuth(req,res)){
        return
    }
    let errors='';
    console.log(req.query)
    let queryMeters = `SELECT personal_accounts.personal_account,personal_accounts.full_name,personal_accounts.street,personal_accounts.house,personal_accounts.apartment,personal_accounts.settlement,meters.id_meters,
    meters.brand,meters.location,meters.status,meters.serial_number,meters.last_readinng,meters.last_readinng_date
    FROM (personal_accounts
    INNER JOIN meters ON personal_accounts.id_personal_account = meters.personal_account_id)
    WHERE personal_accounts.id_personal_account = '${req.query['pers-ac-id']}'`;
        connection.query(queryMeters, async(err, resultMeters) => {
            if (err) {
                console.log("internal error", err);
                return;
            }
            let parseResultMeters = JSON.parse(JSON.stringify(resultMeters));

            let queryReadings = `SELECT meters.serial_number,meters.id_meters, meters.service, meters.location ,readings.*
                FROM ((personal_accounts
                INNER JOIN meters ON personal_accounts.id_personal_account = meters.personal_account_id)
                INNER JOIN readings ON meters.id_meters = readings.id_meter_reading)
                WHERE personal_accounts.id_personal_account = '${req.query['pers-ac-id']}'
                ORDER BY readings.reading_date DESC`;
        connection.query(queryReadings, async(err, resultReadings) => {
            if (err) {
                console.log("internal error", err);
                return;
            }
            let parseResultReadings= JSON.parse(JSON.stringify(resultReadings));

            res.render('admin/readingsPage',{errors:errors,meters:parseResultMeters,readings:parseResultReadings});
        })
        })

}

exports.newReading = async (req, res) => {
    if(isAuth(req,res)){
        return
    }
    let errors='';
    console.log(req.body);
    let user = jwt.verify(req.cookies.admintoken, config.admin_secret);
    let newReadingsQuery = `INSERT INTO readings ( id_meter_reading, reading, source, reading_date) 
          VALUES ('${req.query.meterId}','${Number(req.body.reading)}','${user.name}','${req.body.readingDate}')`;
          connection.query(newReadingsQuery, async(err, result) => {
            if (err) {
                console.log("internal error", err);
                return;
            }
        });

          let updateLastReadingMeters = 
          `UPDATE meters
          SET last_readinng = '${Number(req.body.reading)}', last_readinng_date = '${req.body.readingDate}'
          WHERE id_meters = '${req.query.meterId}';`;
          connection.query(updateLastReadingMeters, async(err, result) => {
            if (err) {
                console.log("internal error", err);
                return;
            }
        });
        res.redirect('back');
}

exports.deleteReading= async (req, res) => {
    if(isAuth(req,res)){
        return
    }
    let errors = '';
    let deleteReading = `DELETE FROM readings WHERE id_reading='${req.query.readingId}';`;
    connection.query(deleteReading, async(err, result) => {
      if (err) {
          console.log("internal error", err);
           res.send("Ви не можете видалити показник, який звязаний з нарахуваням!");
           return
      }else{
        let querylastRead= `SELECT readings.id_reading, readings.reading, readings.reading_date
        FROM meters
        INNER JOIN readings
        ON meters.id_meters = readings.id_meter_reading
        WHERE id_meters = '${req.query.meterId}'
        ORDER BY readings.id_reading DESC 
        LIMIT 1`;
            connection.query(querylastRead, async(err, resultlastRead) => {
                if (err) {
                    console.log("internal error", err);
                    return 
                }
                let parseReslastRead = JSON.parse(JSON.stringify(resultlastRead));
                let lastRead = null;
                let lastReadDate = null;

                if(parseReslastRead!=undefined&&parseReslastRead.length!=0){
                    lastRead = parseReslastRead[0].reading;
                    lastReadDate = parseReslastRead[0].reading_date
                }
                if(lastRead!=null){
                    let queryUpdateMeter= `UPDATE meters
                    SET last_readinng = '${lastRead}', last_readinng_date = '${formatDate( new Date(lastReadDate))}'
                    WHERE id_meters ='${req.query.meterId}'`;
                        connection.query(queryUpdateMeter, async(err, resultlastRead) => {
                            if (err) {
                                console.log("internal error", err);
                                return 
                            }
                        })
                }else{
                    let queryUpdateMeter= `UPDATE meters
                    SET last_readinng = NULL, last_readinng_date = NULL
                    WHERE id_meters ='${req.query.meterId}'`;
                        connection.query(queryUpdateMeter, async(err, resultlastRead) => {
                            if (err) {
                                console.log("internal error", err);
                                return 
                            }
                        })
                }
            })
        res.redirect('back');
      }
  });

  

}

//// PAYMENTS AND ACCURALS


exports.paymentsAndAccruals = async (req, res) => {
    if(isAuth(req,res)){
        return
    }
    let errors='';
    console.log(req.query)
    let queryPayments = `SELECT payments.*
    FROM (personal_accounts
    INNER JOIN payments ON personal_accounts.id_personal_account = payments.personal_account)
    WHERE personal_accounts.id_personal_account = '${req.query['pers-ac-id']}'
    ORDER BY payments.date_time DESC`;
        connection.query(queryPayments, async(err, resultPayments) => {
            if (err) {
                console.log("internal error", err);
                return;
            }
            let parseResultPayments = JSON.parse(JSON.stringify(resultPayments));

            let queryAccurals = `SELECT accrual.*, personal_accounts.number_of_people, readings.*
            FROM ((personal_accounts
            INNER JOIN accrual ON personal_accounts.id_personal_account = accrual.personal_account_id_accrual)
            INNER JOIN readings ON accrual.id_previous_reading= readings.id_reading OR accrual.id_curent_reading = readings.id_reading)
            WHERE personal_accounts.id_personal_account = '${req.query['pers-ac-id']}'
            ORDER BY accrual.id_accrual AND accrual.date DESC`;
        connection.query(queryAccurals, async(err, resultAccurals) => {
            if (err) {
                console.log("internal error", err);
                return;
            }
            let parseResultAccurals= JSON.parse(JSON.stringify(resultAccurals));

            res.render('admin/paymentAndAccuralsPage',{errors:errors,persAcId:req.query['pers-ac-id'],payments:parseResultPayments,accurals:parseResultAccurals});
        })
        })

}

exports.newPayment = async (req, res) => {
    if(isAuth(req,res)){
        return
    }
    let errors='';
    console.log(req.body);
    let user = jwt.verify(req.cookies.admintoken, config.admin_secret);



          let updateBalance = 
          `UPDATE personal_accounts
          SET balance = balance + '${Number(req.body.sum)}'
          WHERE id_personal_account = '${req.query.persAcId}'`;
         await connection.query(updateBalance, async(err, result) => {
            if (err) {
                console.log("internal error", err);
                return;
            }

            let newPaymentQuery = `INSERT INTO payments ( personal_account, sum, status, date_time, way, type, indificator,author_create) 
            VALUES ('${req.query.persAcId}','${Number(req.body.sum)}','${'Оброблений'}','${req.body.paymentDate}','${req.body.way}','${req.body.type}','${req.body.indificator}','${user.name}')`;
          await  connection.query(newPaymentQuery, async(err, result) => {
              if (err) {
                  console.log("internal error", err);
                  return;
              }
          });

        });
        res.redirect('back');
}


/// METERS 

exports.meters = async (req, res) => {
    if(isAuth(req,res)){
        return
    }
    let errors='';
    let queryMeters = `SELECT meters.*
    FROM (personal_accounts
    INNER JOIN meters ON personal_accounts.id_personal_account = meters.personal_account_id)
    WHERE personal_accounts.id_personal_account ='${req.query['pers-ac-id']}'`;
        connection.query(queryMeters, async(err, resultMeters) => {
            if (err) {
                console.log("internal error", err);
                return;
            }
            let parseResultMeters = await JSON.parse(JSON.stringify(resultMeters));
            res.render('admin/metersPage',{errors:errors,persAc:req.query['pers-ac-id'],meters:parseResultMeters});
        })
}

exports.changeMeter= async (req, res) => {
    if(isAuth(req,res)){
        return
    }
    let user = jwt.verify(req.cookies.admintoken, config.admin_secret);
    let errors='';
          let updateMeter = 
          `UPDATE meters
          SET brand = IF('${req.body.brand}'!='', '${req.body.brand}', NULL), serial_number = IF('${req.body.serialNumber}'!='', '${req.body.serialNumber}', NULL),
           location = IF('${req.body.location}'!='', '${req.body.location}', NULL), status = IF('${req.body.status}'!='', '${req.body.status}', NULL),
          release_date = IF('${req.body.releaseDate}'!='', '${req.body.releaseDate}', NULL)  , installation_date =  IF('${req.body.instalDate}'!='', '${req.body.instalDate}', NULL),
          date_of_last_service = IF('${req.body.lastServiceDate}'!='', '${req.body.lastServiceDate}', NULL),
          deinstallation_date = IF('${req.body.deinstaltionDate}'!='', '${req.body.deinstaltionDate}', NULL),
           last_readinng = IF('${req.body.lastReading}'!='', '${req.body.lastReading}', NULL), last_readinng_date = IF('${req.body.lastReadingDate}'!='', '${req.body.lastReadingDate}', NULL), 
           service = IF('${req.body.service}'!='', '${req.body.service}', NULL), type = IF('${req.body.type}'!='', '${req.body.type}', NULL), author_change  = '${user.name}'
          WHERE id_meters = '${req.query.meterId}'`;
          connection.query(updateMeter, async(err, result) => {
            if (err) {
                console.log("internal error", err);
                return;
            }
        });
        res.redirect('back');
}


///// NEW METER

exports.newMeter= async (req, res) => {
    if(isAuth(req,res)){
        return
    }
    let errors = '';
    let user = jwt.verify(req.cookies.admintoken, config.admin_secret);
    let newMeter = `INSERT INTO meters ( personal_account_id, brand, serial_number, location, status, release_date, installation_date, date_of_last_service,
         deinstallation_date, last_readinng, last_readinng_date, type, service, author_create ) 
    VALUES ('${req.query['pers-ac-id']}',IF('${req.body.brand}'!='', '${req.body.brand}', NULL),  IF('${req.body.serialNumber}'!='', '${req.body.serialNumber}', NULL),
    IF('${req.body.location}'!='', '${req.body.location}', NULL), IF('${req.body.status}'!='', '${req.body.status}', NULL),
   IF('${req.body.releaseDate}'!='', '${req.body.releaseDate}', NULL)  , IF('${req.body.instalDate}'!='', '${req.body.instalDate}', NULL),
   IF('${req.body.lastServiceDate}'!='', '${req.body.lastServiceDate}', NULL),
    IF('${req.body.deinstaltionDate}'!='', '${req.body.deinstaltionDate}', NULL),
    IF('${req.body.lastReading}'!='', '${req.body.lastReading}', NULL), IF('${req.body.lastReadingDate}'!='', '${req.body.lastReadingDate}', NULL), '${req.body.type}',  IF('${req.body.service}'!='', '${req.body.service}', NULL), '${user.name}' )`;
    connection.query(newMeter, async(err, result) => {
      if (err) {
          console.log("internal error", err);
          return;
      }
  });
  res.redirect('back');

}

exports.deleteMeter= async (req, res) => {
    if(isAuth(req,res)){
        return
    }
    let errors = '';
    let deleteMeter = `DELETE FROM meters WHERE id_meters='${req.query.meterId}';`;
    connection.query(deleteMeter, async(err, result) => {
      if (err) {
          console.log("internal error", err);
          res.send("Ви не можете видалити лічильник до якого привязані показники")
          return;
      }else{
        res.redirect('back');
      }
  });



}


//// SEALS 

exports.seals = async (req, res) => {
    if(isAuth(req,res)){
        return
    }
    
    let errors='';
    let querySeals= `SELECT meters.brand, meters.serial_number,meters.location, seals.*
    FROM (meters
    INNER JOIN seals ON meters.id_meters = seals.id_meter)
    WHERE meters.id_meters ='${req.query.meterId}'`;
        connection.query(querySeals, async(err, resultSeals) => {
            if (err) {
                console.log("internal error", err);
                return;
            }
            let parseResultSeals = await JSON.parse(JSON.stringify(resultSeals));
            res.render('admin/sealsPage',{errors:errors, meter:req.query.meterId,persAc:req.query.persAc,seals:parseResultSeals});
        })
}

exports.newSeal= async (req, res) => {
    if(isAuth(req,res)){
        return
    }
    let errors = '';
    let user = jwt.verify(req.cookies.admintoken, config.admin_secret);
    let newSeal = `INSERT INTO seals (  id_meter, personal_account, brand_seal, installation_date, serial_number_seal, date_of_withdrawal, author_create ) 
    VALUES ('${req.query.meterId}','${req.query.persAc}',IF('${req.body.brandSeal}'!='', '${req.body.brandSeal}', NULL), IF('${req.body.dateInstalSeal}'!='', '${req.body.dateInstalSeal}', NULL), 
    IF('${req.body.serialNumSeal}'!='', '${req.body.serialNumSeal}', NULL), IF('${req.body.dateDeInstalSeal}'!='', '${req.body.dateDeInstalSeal}', NULL), '${user.name}'  )`;
    connection.query(newSeal, async(err, result) => {
      if (err) {
          console.log("internal error", err);
          return;
      }
  });

  res.redirect('back');

}

exports.deleteSeal= async (req, res) => {
    if(isAuth(req,res)){
        return
    }
    let errors = '';
    let deleteMeter = `DELETE FROM seals WHERE id_seals='${req.query.sealId}';`;
    connection.query(deleteMeter, async(err, result) => {
      if (err) {
          console.log("internal error", err);
          res.send("Помилка при видалені пломби")
          return;
      }else{
        res.redirect('back');
      }
  });

}

exports.changeSeal= async (req, res) => {
    if(isAuth(req,res)){
        return
    }
    let errors='';
    let user = jwt.verify(req.cookies.admintoken, config.admin_secret);
          let updateMeter = 
          `UPDATE seals
          SET brand_seal = IF('${req.body.brandSeal}'!='', '${req.body.brandSeal}', NULL), installation_date =  IF('${req.body.dateInstalSeal}'!='', '${req.body.dateInstalSeal}', NULL), 
          serial_number_seal =  IF('${req.body.serialNumSeal}'!='', '${req.body.serialNumSeal}', NULL), date_of_withdrawal =  IF('${req.body.dateDeInstalSeal}'!='', '${req.body.dateDeInstalSeal}', NULL), author_change = '${user.name}'
          WHERE id_seals='${req.query.sealId}'`;
          connection.query(updateMeter, async(err, result) => {
            if (err) {
                console.log("internal error", err);
                return;
            }
        });
        res.redirect('back');
}



/////


/// CHANGE INFORMATION

exports.changePersAcInformation= async (req, res) => {
    if(isAuth(req,res)){
        return
    }
    let errors = '';
    let query = `SELECT * FROM personal_accounts WHERE id_personal_account = '${req.query["pers-ac-id"]}'`;
    connection.query(query, async(err, result) => {
        if (err) {
            console.log("internal error", err);
            return;
        }
        let parseRes = JSON.parse(JSON.stringify(result));
        console.log(parseRes)

        res.render('admin/changePersAcPage',{errors:errors,persAc:parseRes})
    })

}

exports.changePersAcInformationPost= async (req, res) => {
    if(isAuth(req,res)){
        return
    }
    let errors = '';
    let user = jwt.verify(req.cookies.admintoken, config.admin_secret);
    let query = `UPDATE personal_accounts
    SET number_of_people = '${req.body.numberPeople}', services = '${JSON.stringify(req.body.services)}', balance ='${req.body.balance}', author_change = '${user.name}', agreement = '${req.body.agreement}', water_well = '${req.body.waterWell}' 
    WHERE id_personal_account= '${req.query["pers-ac-id"]}';`;
    connection.query(query, async(err, result) => {
        if (err) {
            console.log("internal error", err);
            return;
        }
        res.redirect('back');
    })

}
/////

/////////
/// NEW PERSONAL ACCOUNT
exports.newPersAc= async (req, res) => {
    if(isAuth(req,res)){
        return
    }
    let errors = '';
    let query = `SELECT MAX(personal_account), MAX(id_personal_account)  FROM personal_accounts`;
    connection.query(query, async(err, result) => {
        if (err) {
            console.log("internal error", err);
            return;
        }
        let parseRes = JSON.parse(JSON.stringify(result));

        res.render('admin/newPersAcPage',{errors:errors,newPersAcNum:parseRes[0]['MAX(personal_account)'],newPersAcID:parseRes[0]['MAX(id_personal_account)']})
    })

}

exports.newPersAccountPost= async (req, res) => {
    if(isAuth(req,res)){
        return
    }
    console.log(req.body);
    let privilchek = (req.body.privilege == 'on') ? '1' : '0';
    let user = jwt.verify(req.cookies.admintoken, config.admin_secret);
    let queryNewPesAccount = `INSERT INTO personal_accounts (id_personal_account, personal_account, full_name, street, house, apartment, settlement, date_of_creation, privilege, type, serviceProvider, number_of_people, services, author_create, agreement  )
    VALUES ('${req.body.personal_account_id}', '${req.body.personal_account_num}', '${req.body.full_name}', '${req.body.street}', '${req.body.house}', '${req.body.apartment}', '${req.body.settlement}',
     '${req.body.date_work_from}', '${privilchek}', '${req.body.type}', '${req.body.service_provader}', '${req.body.num_of_people}', '${JSON.stringify(req.body.services)}', '${user.name}', '${"Є"}'  )`;
    connection.query(queryNewPesAccount, async(err, result) => {
        if (err) {
            console.log("internal error", err);
            return;
        }

    })

    let queryNewAgreement = `INSERT INTO agreements (personal_account_id_agreements, date_of_create, work_from, full_name, type, birth_date, indification_code, street, house, apartment, settlement, author_create )
    VALUES ('${req.body.personal_account_id}', '${req.body.creat_date}', '${req.body.date_work_from}', '${req.body.full_name}', '${req.body.type}', '${req.body.birth_date}', '${req.body.indificate_code}',
     '${req.body.street}', '${req.body.house}', '${req.body.apartment}', '${req.body.settlement}', '${user.name}' )`;
    connection.query(queryNewAgreement, async(err, result) => {
        if (err) {
            console.log("internal error", err);
            return;
        }

    })

    if(privilchek=="1"){
        let queryNewPrivilegePersonDocuments = `INSERT INTO privilege_personal_documents ( personal_account_id_privilege_doc, full_name, indification_code, privilege_type, document_type, document, date_from, author_create )
        VALUES ('${req.body.personal_account_id}', '${req.body.full_name_privilig}', '${req.body.indificate_code_privilig}', '${req.body.code_privilig}', '${req.body.type_document_privilig}', '${req.body.number_of_document_privilig}', '${req.body.date_from_privilig}', '${user.name}')`;
        connection.query(queryNewPrivilegePersonDocuments, async(err, result) => {
            if (err) {
                console.log("internal error", err);
                return;
            }


        })
    }
    res.redirect('/admin-panel-controll')
}
///////////////////////////////////////


//// PERSONAL ACCOUNTS NEWS
exports.persAcNews= async (req, res) => {
    if(isAuth(req,res)){
        return
    }
    let errors = '';
    let query = `SELECT * FROM news_for_personal_accounts ORDER BY id_news_for_personal_accounts DESC`;
    connection.query(query, async(err, result) => {
        if (err) {
            console.log("internal error", err);
            return;
        }
        let parseRes = JSON.parse(JSON.stringify(result));

        res.render('admin/persnalAcNewsPage',{errors:errors,news:parseRes})
    })

}

/// NEW PERSONAL ACCOUNT  NEWS
exports.newpersAcNews= async (req, res) => {
    if(isAuth(req,res)){
        return
    }
    let errors = '';
    let user = jwt.verify(req.cookies.admintoken, config.admin_secret);
    let query = `INSERT INTO news_for_personal_accounts (header, body, creat_date, status, author)
    VALUES ('${req.body.header}', '${req.body.body.replace("'","’")}', '${formatDate(new Date())}', '${"0"}', '${user.name}');`;
    connection.query(query, async(err, result) => {
        if (err) {
            console.log("internal error", err);
            return;
        }
        res.redirect('back');
    })

}

/// ACTIVATE AND DEACTIVATE PERSONAL ACCOUNT  NEWS
exports.activatePersAcNews= async (req, res) => {
    if(isAuth(req,res)){
        return
    }
    let errors = '';
    let query = `UPDATE news_for_personal_accounts
    SET status = '1'
    WHERE id_news_for_personal_accounts = '${req.query.newsId}';`;
    connection.query(query, async(err, result) => {
        if (err) {
            console.log("internal error", err);
            return;
        }
        res.redirect('back');
    })

}

exports.deactivatePersAcNews= async (req, res) => {
    if(isAuth(req,res)){
        return
    }
    let errors = '';
    let query = `UPDATE news_for_personal_accounts
    SET status = '0'
    WHERE id_news_for_personal_accounts = '${req.query.newsId}';`;
    connection.query(query, async(err, result) => {
        if (err) {
            console.log("internal error", err);
            return;
        }
        res.redirect('back');
    })


}

/////////////////////


/// NEWS ON WEB SITE



exports.news= async (req, res) => {
    if(isAuth(req,res)){
        return
    }
    let errors = '';
    let query = `SELECT * FROM news ORDER BY id_news DESC`;
    connection.query(query, async(err, result) => {
        if (err) {
            console.log("internal error", err);
            return;
        }
        let parseRes = JSON.parse(JSON.stringify(result));

        res.render('admin/newsPage',{errors:errors,news:parseRes})
    })

}

/// NEW   NEWS
exports.newNews= async (req, res) => {
    if(isAuth(req,res)){
        return
    }
    let errors = '';
    let user = jwt.verify(req.cookies.admintoken, config.admin_secret);
    let query = `INSERT INTO news (header, body, date, status, image, author_create)
    VALUES ('${req.body.header}', '${req.body.body.replace("'","’")}', '${formatDate(new Date())}', '${"0"}', '${req.body.image}', '${user.name}');`;
    connection.query(query, async(err, result) => {
        if (err) {
            console.log("internal error", err);
            return;
        }
        res.redirect('back');
    })

}

/// ACTIVATE AND DEACTIVATE PERSONAL ACCOUNT  NEWS
exports.activateNews= async (req, res) => {
    if(isAuth(req,res)){
        return
    }
    let errors = '';
    let query = `UPDATE news
    SET status = '1'
    WHERE id_news = '${req.query.newsId}';`;
    connection.query(query, async(err, result) => {
        if (err) {
            console.log("internal error", err);
            return;
        }
        res.redirect('back');
    })

}

exports.deactivateNews= async (req, res) => {
    if(isAuth(req,res)){
        return
    }
    let errors = '';
    let query = `UPDATE news
    SET status = '0'
    WHERE id_news = '${req.query.newsId}';`;
    connection.query(query, async(err, result) => {
        if (err) {
            console.log("internal error", err);
            return;
        }
        res.redirect('back');
    })


}

let telegramBot = require('../telegramBot/telBot');

exports.telegramNews= async (req, res) => {
    if(isAuth(req,res)){
        return
    }
    let errors = '';
    res.render('admin/telegramMesPage',{errors:errors});
}

exports.telegramNewsPost= async (req, res) => {
    if(isAuth(req,res)){
        return
    }
    let errors = '';
    
    await telegramBot.mesForAll(req.body.image,req.body.body);
    errors = "Повідомлення успішно надіслані"
    res.render('admin/telegramMesPage',{errors:errors});
}
/// PERSONA: MESSAGE TELEGRAM
exports.telegramPersMes= async (req, res) => {
    if(isAuth(req,res)){
        return
    }
    let errors = '';
    let query= `SELECT telegram_ac_id
    FROM telegrams_users
    WHERE id_telegrams_users = '${req.query.telegramId}'`;
    connection.query(query, async(err, result) => {
        if (err) {
            console.log("internal error", err);
            return;
        }
        let parseRes = JSON.parse(JSON.stringify(result));
        res.render('admin/personalTelegramMesPage',{errors:errors,tel:req.query.telegramId,telAc:parseRes[0].telegram_ac_id });
    });


}

exports.telegramPersMesPost= async (req, res) => {
    if(isAuth(req,res)){
        return
    }
    let errors = '';
    
    await telegramBot.personalMes(req.query.telId,req.body.image,req.body.body);
    errors = "Повідомлення успішно надіслано"
    res.render('admin/personalTelegramMesPage',{errors:errors,tel:req.query.tel,telAc:req.query.telId })
}

/////////////////////

///   CLOSE AND CLOSE PERS ACCOUNT
exports.closePersAc= async (req, res) => {
    if(isAuth(req,res)){
        return
    }
    let user = jwt.verify(req.cookies.admintoken, config.admin_secret);
    let query= `UPDATE personal_accounts
    SET closing_date= '${formatDate(new Date())}', author_change = '${user.name}'
    WHERE id_personal_account = '${req.query.persId}'`;
    connection.query(query, async(err, result) => {
        if (err) {
            console.log("internal error", err);
            return;
        }
    });
    res.redirect('/admin-panel-controll/main')
}

exports.deletePersAc= async (req, res) => {
    if(isAuth(req,res)){
        return
    }
    let query= `DELETE FROM personal_accounts
    WHERE id_personal_account = '${req.query.persId}'`;
    connection.query(query, async(err, result) => {
        if (err) {
            console.log("internal error", err);
            return;
        }
    });
    res.redirect('/admin-panel-controll/main')
}

////





///// audit///////////////

exports.auditPayments= async (req, res) => {
    if(isAuth(req,res)){
        return
    }
    let errors = '';
    res.render('admin/auditPaymentsPage',{errors:errors, info:'', payments:'',sum:undefined, len:undefined});
}


exports.auditPaymentsPost= async (req, res) => {
    if(isAuth(req,res)){
        return
    }
    let errors = '';
    let way =``;
    if(req.body.way !="all"){
        way = `AND payments.way = '${req.body.way}'`
    }
    
    let query= `SELECT personal_accounts.personal_account AS personalAccount, payments.*
    FROM payments 
    INNER JOIN personal_accounts
    ON payments.personal_account = personal_accounts.id_personal_account 
    where DATE(payments.date_time) BETWEEN '${formatDate(new Date(req.body.dateFrom))}' AND '${formatDate(new Date(req.body.dateTo))}' ${way}`;
    connection.query(query, async(err, result) => {
        if (err) {
            console.log("internal error", err);
            return;
        }
        let parseRes = JSON.parse(JSON.stringify(result));
        let sum =0;
        for (let i = 0; i < parseRes.length; i++) {
            const element = parseRes[i].sum;
            sum+=element
        }
        let len = parseRes.length
        res.render('admin/auditPaymentsPage',{errors:errors, info:`Дата: ${formatDate(new Date(req.body.dateFrom))} - ${formatDate(new Date(req.body.dateTo))}, Джерело:${req.body.way}, Автор:${req.body.author}`, payments:parseRes, sum:sum,len:len});
    });

    
}



exports.auditReadings= async (req, res) => {
    if(isAuth(req,res)){
        return
    }
    let errors = '';
    res.render('admin/auditReadingsPage',{errors:errors, info:'', payments:'',sum:undefined});
}


exports.auditReadingsPost= async (req, res) => {
    if(isAuth(req,res)){
        return
    }
    let errors = '';
    let way =``;
    let waterWel =``;
    if(req.body.way !="all"){
        way = `AND readings.source = '${req.body.way}'`
    }

    if(req.body.waterWell !="all"){
        waterWel = `AND personal_accounts.water_well = '${req.body.waterWell}'`
    }
    
    let query= `SELECT personal_accounts.personal_account, personal_accounts.water_well, readings.*
    FROM ((readings 
    INNER JOIN meters ON readings.id_meter_reading = meters.id_meters )
    INNER JOIN personal_accounts ON meters.personal_account_id = personal_accounts.id_personal_account)
    where DATE(readings.reading_date) BETWEEN '${formatDate(new Date(req.body.dateFrom))}' AND '${formatDate(new Date(req.body.dateTo))}' ${way} ${waterWel}`;
    connection.query(query, async(err, result) => {
        if (err) {
            console.log("internal error", err);
            return;
        }
        let parseRes = JSON.parse(JSON.stringify(result));
        let sum =parseRes.length;
        res.render('admin/auditReadingsPage',{errors:errors, info:`Дата: ${formatDate(new Date(req.body.dateFrom))} - ${formatDate(new Date(req.body.dateTo))}, Джерело:${req.body.way}, Скважина :${req.body.waterWell}`, payments:parseRes, sum:sum});
    });

    
}




///////////////////

/////auto accruals

exports.autoAccruals= async (req, res) => {
    if(isAuth(req,res)){
        return
    }
    let errors = '';
    res.render('admin/autoAccrualsPage',{errors:errors});
}
exports.autoAccrualsCheckPost= async (req, res) => {
    if(isAuth(req,res)){
        return
    }
    let errors = '';

    let query= `SELECT  personal_accounts.personal_account
    FROM (((personal_accounts
    INNER JOIN meters ON personal_accounts.id_personal_account = meters.personal_account_id )
    LEFT JOIN readings ON readings.id_meter_reading = meters.id_meters)
    LEFT JOIN accrual ON accrual.personal_account_id_accrual = personal_account_id_accrual)
    where 
    ( meters.last_readinng_date is NULL OR DATE(meters.last_readinng_date) NOT BETWEEN '${formatDate(new Date(req.body.dateFrom))}' AND '${formatDate(new Date(req.body.dateTo))}')
    group by personal_accounts.personal_account
    ORDER BY personal_accounts.personal_account`;
    connection.query(query, async(err, result) => {
        if (err) {
            console.log("internal error", err);
            return;
        }
        let parseRes = JSON.parse(JSON.stringify(result));

        for (let i = 0; i < parseRes.length; i++) {
                const element = parseRes[i].personal_account;
                let query= `UPDATE personal_accounts
                SET accural_status = 'Руч'
                WHERE personal_account = '${element}'`;
                connection.query(query, async(err, result) => {
                    if (err) {
                        console.log("internal error", err);
                        return;
                    }
                });

            
        }
    });

    res.render('admin/autoAccrualsPage',{errors:errors});
}

exports.autoAccrualsClearMarks= async (req, res) => {
    if(isAuth(req,res)){
        return
    }
    let errors = '';

  
    let query= `UPDATE personal_accounts
    SET accural_status = ''`;
    connection.query(query, async(err, result) => {
        if (err) {
            console.log("internal error", err);
            return;
        }
    });
    res.render('admin/autoAccrualsPage',{errors:errors});
}




exports.autoAccrualsPost= async (req, res) => {
    if(isAuth(req,res)){
        return
    }
    let errors = '';
    let way =``;
    let waterWel =``;
    if(req.body.way !="all"){
        way = `AND readings.source = '${req.body.way}'`
    }

    if(req.body.waterWell !="all"){
        waterWel = `AND personal_accounts.water_well = '${req.body.waterWell}'`
    }
    
    let query= `SELECT personal_accounts.personal_account, personal_accounts.water_well, readings.*
    FROM ((readings 
    INNER JOIN meters ON readings.id_meter_reading = meters.id_meters )
    INNER JOIN personal_accounts ON meters.personal_account_id = personal_accounts.id_personal_account)
    where DATE(readings.reading_date) BETWEEN '${formatDate(new Date(req.body.dateFrom))}' AND '${formatDate(new Date(req.body.dateTo))}' ${way} ${waterWel}`;
    connection.query(query, async(err, result) => {
        if (err) {
            console.log("internal error", err);
            return;
        }
        let parseRes = JSON.parse(JSON.stringify(result));
        let sum =parseRes.length;
        res.render('admin/auditReadingsPage',{errors:errors, info:`Дата: ${formatDate(new Date(req.body.dateFrom))} - ${formatDate(new Date(req.body.dateTo))}, Джерело:${req.body.way}, Скважина :${req.body.waterWell}`, payments:parseRes, sum:sum});
    });

    
}


/////////////

////// hand accural/////


exports.handAccrual= async (req, res) => {
    if(isAuth(req,res)){
        return
    }
    let errors = '';
    //// , readings.* LEFT JOIN readings ON accrual.id_previous_reading= readings.id_reading OR accrual.id_curent_reading = readings.id_reading)
    let queryAccurals = `SELECT accrual.*
    FROM (personal_accounts
    INNER JOIN accrual ON personal_accounts.id_personal_account = accrual.personal_account_id_accrual)
    WHERE personal_accounts.id_personal_account = '${req.query['pers-ac-id']}'
    ORDER BY accrual.id_accrual DESC`;
    connection.query(queryAccurals, async(err, resultAccurals) => {
        if (err) {
            console.log("internal error", err);
            return;
        }
        let parseResultAccurals = JSON.parse(JSON.stringify(resultAccurals));
        console.log(parseResultAccurals)
        ////////
        let querypersAcAndTarifs = `SELECT personal_accounts.personal_account,personal_accounts.type, personal_accounts.number_of_people, tarifs.*
        FROM personal_accounts
        INNER JOIN tarifs on personal_accounts.type = tarifs.consumer_type
        WHERE personal_accounts.id_personal_account ='${req.query['pers-ac-id']}'`;
        connection.query(querypersAcAndTarifs, async(err, resultPersAcAndTarif) => {
            if (err) {
                console.log("internal error", err);
                return;
            }
            let parseResultPersAcAndTrifs= JSON.parse(JSON.stringify(resultPersAcAndTarif));

        res.render('admin/HandAccuralsPage',{errors:errors, persAcId: req.query['pers-ac-id'],accurals:parseResultAccurals,persAcAndTrifs:parseResultPersAcAndTrifs});
        })
    });
}

exports.newHandAccuralRubbish= async (req, res) => {
    if(isAuth(req,res)){
        return
    }
    let errors = '';
    let user = jwt.verify(req.cookies.admintoken, config.admin_secret);
  
    let query= `INSERT INTO accrual (personal_account_id_accrual, date, accrual_rubbish, sum, personal_account_type, author_create,type,tarifl_rubbish, num_people)
    VALUES ('${req.query.persAcId}','${formatDate(new Date)}','${req.body.sum}','${req.body.sum}','${req.body.typeAc}','${user.name}','${'Сміття'}','${req.body.tarif}' ,'${req.body.numP}')`;
    connection.query(query, async(err, result) => {
        if (err) {
            console.log("internal error", err);
            return;
        }
    });
    res.redirect(`/admin-panel-controll/accurals?pers-ac-id=${req.query.persAcId}`)
}


//////////////////////////








function isAuth(req,res){
    const token = req.cookies.admintoken
    if (!token) {
        res.redirect('/admin-panel-controll')
        return true
      }
      let payload
      try {
        payload = jwt.verify(token, config.admin_secret);
        console.log(payload)
      } catch (e) {
        if (e instanceof jwt.JsonWebTokenError) {
            res.redirect('/admin-panel-controll')
            return true
        }
        res.redirect('/admin-panel-controll')
        return true
      }
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


