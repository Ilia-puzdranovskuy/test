const config = require('../config');
let uniquID = require('generate-unique-id');
let jwt = require("jsonwebtoken");

let LiqPay = require('../liqpay/liqpay');
const { private_liqpay, pulic_liqpay } = require('../config');
var liqpay = new LiqPay(config.pulic_liqpay, config.private_liqpay);
const crypto = require('crypto');


exports.newLiqPayPayment  = async (req, res) => {
  console.log(req.body);
  console.log('////////////////////////');
  console.log('sign:'+liqpay.base64_encode( crypto.sha1( private_liqpay + req.body.data + private_liqpay ) ))
  console.log(liqpay.str_to_sign(private_liqpay+req.body.data+pulic_liqpay))
  
}


exports.entry = async (req, res) => {
    if(isAuth(req,res)){
        return
    }
    const token = req.cookies.token
    let payload = jwt.verify(token, config.secret);

    let curentHome = req.query.curentHome;

    let query = `SELECT personal_accounts.*,tarifs.*
    FROM ((web_accounts  
    INNER JOIN personal_accounts ON web_accounts.id_web_accounts =personal_accounts.web_account_id)
    INNER JOIN tarifs ON personal_accounts.type =tarifs.consumer_type)
    WHERE web_accounts.id_web_accounts = ${payload.id}
    ORDER BY personal_accounts.personal_account`;
    
    
    connection.query(query, async(err, result) => {
        if (err) {
            console.log("internal error", err);
            return;
        }
        let parseRes = JSON.parse(JSON.stringify(result));
        let newsQuery = `SELECT * FROM news_for_personal_accounts WHERE status = '1'`;
        if(curentHome == undefined) curentHome = parseRes[0].personal_account
        connection.query(newsQuery, async(err, result) => {
          if (err) {
              console.log("internal error", err);
              return;
          }
          let parseResNews = JSON.parse(JSON.stringify(result));
          let idpay = uniquID()
          var html = liqpay.cnb_form({
            'action'         : 'pay',
            'amount'         : '1',
            'currency'       : 'UAH',
            'description'    : 'description text',
            'order_id'       : idpay,
            'version'        : '3',
            'result_url'     : 'https://test-illia-vds.fun/personal-account',
            'server_url'     : 'https://test-illia-vds.fun/liqpay-payments'
            });

          res.render("accountPages/personalAccount",{homeAllInf:parseRes,curentURLPlace:"/personal-account",param:curentHome,news:parseResNews,pay:html});
        });
      });


}

exports.readingsPage = async (req, res) => {
  if(isAuth(req,res)){
      return
  }
  const token = req.cookies.token
  let payload = jwt.verify(token, config.secret);

  let curentHome = req.query.curentHome;

  let query = `SELECT personal_accounts.street,personal_accounts.house,personal_accounts.apartment,personal_accounts.settlement,personal_accounts.personal_account
  FROM (web_accounts  
  INNER JOIN personal_accounts ON web_accounts.id_web_accounts =personal_accounts.web_account_id)
  WHERE web_accounts.id_web_accounts = ${payload.id}
  ORDER BY personal_accounts.personal_account`;
  
    connection.query(query, async(err, result) => {
      if (err) {
          console.log("internal error", err);
          return;
      }
      let parseRes = JSON.parse(JSON.stringify(result));
      if(curentHome == undefined) curentHome = parseRes[0].personal_account
      let metersQuery = `SELECT  meters.*
      FROM ((web_accounts  
      INNER JOIN personal_accounts ON web_accounts.id_web_accounts =personal_accounts.web_account_id)
      INNER JOIN meters ON personal_accounts.id_personal_account =meters.personal_account_id)
      WHERE web_accounts.id_web_accounts ='${payload.id}' AND personal_accounts.personal_account = '${curentHome}'`;
      //metters
      connection.query(metersQuery, async(err, resultMeters) => {
        if (err) {
            console.log("internal error", err);
            return;
        }
        console.log(resultMeters)
        let parseResMeters = JSON.parse(JSON.stringify(resultMeters));
          //readings
          connection.query(query, async(err, result) => {
            if (err) {
                console.log("internal error", err);
                return;
            }
            let parseRes = JSON.parse(JSON.stringify(result));
            if(curentHome == undefined) curentHome = parseRes[0].personal_account
            let readingsQuery = `SELECT  meters.serial_number, meters.service, meters.location ,readings.*
            FROM (((web_accounts  
            INNER JOIN personal_accounts ON web_accounts.id_web_accounts =personal_accounts.web_account_id)
            INNER JOIN meters ON personal_accounts.id_personal_account =meters.personal_account_id)
            INNER JOIN readings ON meters.id_meters =readings.id_meter_reading)
            WHERE web_accounts.id_web_accounts ='${payload.id}' AND personal_accounts.personal_account = '${curentHome}'
            ORDER BY readings.reading_date DESC`;
            
            connection.query(readingsQuery, async(err, resultReadings) => {
              if (err) {
                  console.log("internal error", err);
                  return;
              }
              let parseResReadings = JSON.parse(JSON.stringify(resultReadings));
              res.render("accountPages/personalAccountReadings",{homeAllInf:parseRes,curentURLPlace:"/personal-account/readings",param:curentHome,meters:parseResMeters,readings:parseResReadings});
            });
          });

      });
    });



}



exports.newReadings = async (req, res) => {
  if(isAuth(req,res)){
      return
  }
  const token = req.cookies.token;
  let payload = jwt.verify(token, config.secret);
  console.log(req.body);
  console.log(payload);
  for (const key in req.body) {
    if (Object.hasOwnProperty.call(req.body, key)) {
      let date = formatDate(new Date())
        const element = req.body[key];
          let newReadingsQuery = `INSERT INTO readings ( id_meter_reading, reading, source, reading_date) 
          VALUES ('${key}','${element}','${'Сайт'}','${date}')`;
          connection.query(newReadingsQuery, async(err, result) => {
            if (err) {
                console.log("internal error", err);
                return;
            }
        });

          let updateLastReadingMeters = 
          `UPDATE meters
          SET last_readinng = '${element}', last_readinng_date = '${date}'
          WHERE id_meters = '${key}';`;
          connection.query(updateLastReadingMeters, async(err, result) => {
            if (err) {
                console.log("internal error", err);
                return;
            }
        });
  
    }
  }

  res.redirect('/personal-account/readings')

}

exports.addPersAcPage = async (req, res) => {
  if(isAuth(req,res)){
      return
  }
  const token = req.cookies.token;
  let payload = jwt.verify(token, config.secret);
  
  res.render("accountPages/addPersAcPage",{errors:''})
}

exports.addPersAcWeb = async (req, res) => {
  if(isAuth(req,res)){
      return
  }
  const token = req.cookies.token;
  let payload = jwt.verify(token, config.secret);
  let query = `SELECT id_personal_account,web_account_id
  FROM personal_accounts 
  WHERE settlement = '${req.body.settlement}' && personal_account = '${req.body.personalAccount}'`;
  
    connection.query(query, async(err, result) => {
      if (err) {
          console.log("internal error", err);
          return;
      }
      let parseRes = JSON.parse(JSON.stringify(result));
      if(parseRes!=undefined&&parseRes.length!=0){
        if(parseRes[0].web_account_id==undefined){
          let queryUpdate = `UPDATE personal_accounts
          SET web_account_id = ${payload.id} 
          WHERE settlement = '${req.body.settlement}' && personal_account = '${req.body.personalAccount}'`;
            connection.query(queryUpdate, async(err, result) => {
              if (err) {
                  console.log("internal error", err);
                  return;
              }
            })
            res.redirect('/personal-account')
        }else{
          res.render("accountPages/addPersAcPage",{errors:'Даний особовий рахунок використовується іншим веб-аккаунтом!'})
        }
      }else{
        res.render("accountPages/addPersAcPage",{errors:'Даного особового рахунку не знайдено!'})
      }

    })

}

///////payments

exports.payments  = async (req, res) => {
  if(isAuth(req,res)){
      return
  }
  const token = req.cookies.token
  let payload = jwt.verify(token, config.secret);

  let curentHome = req.query.curentHome;

  let query = `SELECT personal_accounts.street,personal_accounts.house,personal_accounts.apartment,personal_accounts.settlement,personal_accounts.personal_account
  FROM (web_accounts  
  INNER JOIN personal_accounts ON web_accounts.id_web_accounts =personal_accounts.web_account_id)
  WHERE web_accounts.id_web_accounts = ${payload.id}
  ORDER BY personal_accounts.personal_account`;
  
    connection.query(query, async(err, result) => {
      if (err) {
          console.log("internal error", err);
          return;
      }
      let parseRes = JSON.parse(JSON.stringify(result));
      if(curentHome == undefined) curentHome = parseRes[0].personal_account
      
      //payments
      let paymentsQuery = `SELECT  payments.*
      FROM ((web_accounts  
      INNER JOIN personal_accounts ON web_accounts.id_web_accounts =personal_accounts.web_account_id)
      INNER JOIN payments ON personal_accounts.id_personal_account =payments.personal_account)
      WHERE web_accounts.id_web_accounts ='${payload.id}' AND personal_accounts.personal_account = '${curentHome}'`;
      //metters
      connection.query(paymentsQuery, async(err, resultpayments) => {
        if (err) {
            console.log("internal error", err);
            return;
        }
        let parseResPayments = JSON.parse(JSON.stringify(resultpayments));
        console.log(resultpayments)

        //accurals
        let accuralsQuery = `SELECT  accrual.*
      FROM ((web_accounts  
      INNER JOIN personal_accounts ON web_accounts.id_web_accounts =personal_accounts.web_account_id)
      INNER JOIN accrual ON personal_accounts.id_personal_account =accrual.personal_account_id_accrual)
      WHERE web_accounts.id_web_accounts ='${payload.id}' AND personal_accounts.personal_account = '${curentHome}'`;
      //metters
      connection.query(accuralsQuery, async(err, resultaccurals) => {
        if (err) {
            console.log("internal error", err);
            return;
        }
        let parseResaccurals = JSON.parse(JSON.stringify(resultaccurals));
        console.log(resultaccurals)

        
        res.render("accountPages/paymentsPage",{homeAllInf:parseRes,curentURLPlace:"/personal-account/payments",param:curentHome,payments:parseResPayments,accurals:parseResaccurals});
      });
      });



      
    });
          

     



}





function isAuth(req,res){
    const token = req.cookies.token
    if (!token) {
        res.redirect('/singin')
        return true
      }
      let payload
      try {
        payload = jwt.verify(token, config.secret);
      } catch (e) {
        if (e instanceof jwt.JsonWebTokenError) {
            res.redirect('/singin')
            return true
        }
        res.redirect('/singin')
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