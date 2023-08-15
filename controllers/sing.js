
const config = require('../config');

let jwt = require("jsonwebtoken");
let bcrypt = require("bcryptjs");

const nodemailer = require('nodemailer');
let transporter = nodemailer.createTransport({
    service: config.mailService,
    auth: {
      user: config.mailUser,
      pass: config.mailPassword
    }
  });


exports.singup = async (req, res) => {
    let query = `SELECT id_personal_account,web_account_id FROM personal_accounts WHERE personal_account ='${req.body.personalAccount}' AND settlement ='${req.body.settlement}' `;
    await connection.query(query, async(err, result) => {
        if (err) {
            console.log("internal error", err);
            return;
        }
        console.log(result[0]);
        let errors = "";
        if(result.length==0){
            errors="Даного особового рахунку не знайдено "
            res.render("pages/singup",{errors:errors})  
        }else{
            let parseResult = JSON.parse(JSON.stringify(result))[0];
           if(parseResult.web_account_id==undefined){
             //Якщо пошта зайнята
             let query1 = `SELECT email FROM web_accounts WHERE email ='${req.body.email}'`;
             await connection.query(query1, async(err, result) => {
                 if (err) {
                     console.log("internal error", err);
                     return;
                 }
                 let emailErrors = "";
                 if(result.length==0){
                     let randomnumber = Math.floor(Math.random() * (999999- 100000 + 1)) + 100000;
                     createWebAcount (parseResult.id_personal_account,req.body,randomnumber);
                     sendEmailWithCodeCreateAcount(randomnumber,req.body.email);
                     res.redirect(`/singup-activate-link?email=${req.body.email}`)
                 }else{
                     emailErrors=`Пошта ${JSON.parse(JSON.stringify(result))[0].email} вже зайнята`
                     res.render("pages/singup",{errors:emailErrors}) 
                 }
 
             }); 
           }else{
            res.render("pages/singup",{errors:'Даний особовий рахунок вже використовується іншим користувачем'})
           }

        }
    });
  };

  exports.activateWebAccount  = async (req, res) => {
    let email = req.query.email
    let query = `SELECT activate FROM web_accounts WHERE email ='${email}' AND activateCodeEmail = '${req.body.code}'`;
    await connection.query(query, async(err, result) => {
        if (err) {
            console.log("internal error", err);
            return;
        }
        console.log(result[0]);
        let parsResult =JSON.parse(JSON.stringify(result))[0];
        let errors = "";
        if(parsResult == undefined){
            errors="Код не вірний"
            res.render("pages/singupActivateLink",{email:email,errors:errors}) 
        }else{

            if(  parsResult.activate ==1){
                errors="Аккаунт вже активовано"
                res.render("pages/singupActivateLink",{email:email,errors:errors}) 
            }else{
                activateWebAc(email,req.body.code);
                res.redirect("/singin")
            }

        }
    });
  };

  exports.singin = async (req, res) => {
    let query = `SELECT id_web_accounts, password FROM web_accounts WHERE email ='${req.body.email}'`;
    await connection.query(query, async(err, result) => {
        if (err) {
            console.log("internal error", err);
            return;
        }

        let errors = "";
        if(result.length==0){
            errors="Невірний email ";
            res.render("pages/singin",{errors:errors})  
        }else{
            let parseResult = JSON.parse(JSON.stringify(result))[0];
            let passwordIsValid = bcrypt.compareSync(
                req.body.password,
                parseResult.password
              );
              if (!passwordIsValid) {
                errors="Невірний пароль";
                res.render("pages/singin",{errors:errors})
              }else{
                let token = jwt.sign({ id: parseResult.id_web_accounts }, config.secret, {
                    expiresIn: 86400*900 // 24 hours
                  });
                  res.cookie('token', token, { maxAge: 86400*900 });
                  res.redirect("/personal-account")
              }
        }
    });
  };
  
  exports.forgotPasswordEmail = async (req, res) => {
    let query = `SELECT id_web_accounts FROM web_accounts WHERE email = '${req.body.email}' `;
    connection.query(query, async(err, result) => {
        if (err) {
            console.log("internal error", err);
            return;
        }
        let results = JSON.parse(JSON.stringify(result));
        if(results != undefined&&results.length!=0){
            let randomnumber = Math.floor(Math.random() * (999999- 100000 + 1)) + 100000;
            let queryUpdate = `UPDATE web_accounts SET activateCodeEmail = '${randomnumber}' WHERE email = '${req.body.email}'`;
            connection.query(queryUpdate, async(err, result) => {
                if (err) {
                    console.log("internal error", err);
                    return;
                }
            });
            sendEmailWithCodeCreateAcount(randomnumber,req.body.email);
            res.render('pages/forgotPasswordCode',{errors:"",email:req.body.email});
        }else{
            res.render('pages/forgotPasswordEmail',{errors:"Даної пошти не знайдено, спробуйте ще раз!"});
        }
    })

  };

  exports.forgotPasswordCode= async (req, res) => {
    let query = `SELECT id_web_accounts FROM web_accounts WHERE email = '${req.query.email}' && activateCodeEmail = '${req.body.code}'`;
    connection.query(query, async(err, result) => {
        if (err) {
            console.log("internal error", err);
            return;
        }
        let results = JSON.parse(JSON.stringify(result));
        if(results != undefined&&results.length!=0){
            res.render('pages/newPassword',{errors:"",id:results[0].id_web_accounts});
        }else{
            res.render('pages/forgotPasswordCode',{errors:"Невірний код",email:req.query.email});
        }
    })

  };

  exports.newPassword= async (req, res) => {
    let queryUpdate = `UPDATE web_accounts SET password = '${bcrypt.hashSync(req.body.password,8)}' WHERE id_web_accounts = '${req.query.id}'`;
    connection.query(queryUpdate, async(err, result) => {
        if (err) {
            console.log("internal error", err);
            return;
        }
        res.redirect("/personal-account")
    });
    
  };


  function createWebAcount (id_pers_ac,body,code){

    let queryInsert = `INSERT INTO web_accounts ( phone_number, email, password, type,activateCodeEmail, create_date) VALUES ('${body.phone}','${body.email}','${bcrypt.hashSync(body.password,8)}','1','${code}','${formatDate(new Date())}')`;
    connection.query(queryInsert, async(err, result) => {
        if (err) {
            console.log("internal error", err);
            return;
        }
    });

    let query = `SELECT id_web_accounts FROM web_accounts WHERE email = '${body.email}' `;
    connection.query(query, async(err, result) => {
        if (err) {
            console.log("internal error", err);
            return;
        }
        let res = JSON.parse(JSON.stringify(result))[0]
        console.log(res)
        
        let queryUpdate = `UPDATE personal_accounts SET web_account_id = '${res.id_web_accounts}' WHERE id_personal_account = '${id_pers_ac}'`;
        connection.query(queryUpdate, async(err, result) => {
            if (err) {
                console.log("internal error", err);
                return;
            }
            console.log("New user created");
            
        });

  });
  }

  function sendEmailWithCodeCreateAcount(code,email){
    var mailOptions = {
        from: 'ilia.puzdranokuy@gmail.com',
        to: email,
        subject: 'Ккод для активації аккаунту',
        html: `<h1>КП "ВІНЬКОВЕЦЬКИЙ КОМУНСЕРВІС"</h1><p>Ваш код:</p><h3>'${code}'</h3>`
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
  }



  function activateWebAc(email,code){
    let query = `UPDATE web_accounts SET activate ='1' WHERE email ='${email}' AND activateCodeEmail = '${code}'`;
    connection.query(query, async(err, result) => {
        if (err) {
            console.log("internal error", err);
            return;
        }
    });

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