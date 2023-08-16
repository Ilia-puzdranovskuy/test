
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
        subject: 'ВІНЬКОВЕЦЬКИЙ КОМУНСЕРВІС',
        html: `
        <!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Simple Transactional Email</title>
    <style>
      /* -------------------------------------
          GLOBAL RESETS
      ------------------------------------- */
      
      /*All the styling goes here*/
      
      img {
        border: none;
        -ms-interpolation-mode: bicubic;
        max-width: 100%; 
      }

      body {
        background-color: #f6f6f6;
        font-family: sans-serif;
        -webkit-font-smoothing: antialiased;
        font-size: 14px;
        line-height: 1.4;
        margin: 0;
        padding: 0;
        -ms-text-size-adjust: 100%;
        -webkit-text-size-adjust: 100%; 
      }

      table {
        border-collapse: separate;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
        width: 100%; }
        table td {
          font-family: sans-serif;
          font-size: 14px;
          vertical-align: top; 
      }

      /* -------------------------------------
          BODY & CONTAINER
      ------------------------------------- */

      .body {
        background-color: #f6f6f6;
        width: 100%; 
      }

      /* Set a max-width, and make it display as block so it will automatically stretch to that width, but will also shrink down on a phone or something */
      .container {
        display: block;
        margin: 0 auto !important;
        /* makes it centered */
        max-width: 580px;
        padding: 10px;
        width: 580px; 
      }

      /* This should also be a block element, so that it will fill 100% of the .container */
      .content {
        box-sizing: border-box;
        display: block;
        margin: 0 auto;
        max-width: 580px;
        padding: 10px; 
      }

      /* -------------------------------------
          HEADER, FOOTER, MAIN
      ------------------------------------- */
      .main {
        background: #ffffff;
        border-radius: 3px;
        width: 100%; 
      }

      .wrapper {
        box-sizing: border-box;
        padding: 20px; 
      }

      .content-block {
        padding-bottom: 10px;
        padding-top: 10px;
      }

      .footer {
        clear: both;
        margin-top: 10px;
        text-align: center;
        width: 100%; 
      }
        .footer td,
        .footer p,
        .footer span,
        .footer a {
          color: #999999;
          font-size: 12px;
          text-align: center; 
      }

      /* -------------------------------------
          TYPOGRAPHY
      ------------------------------------- */
      h1,
      h2,
      h3,
      h4 {
        color: #000000;
        font-family: sans-serif;
        font-weight: 400;
        line-height: 1.4;
        margin: 0;
        margin-bottom: 30px; 
      }

      h1 {
        font-size: 35px;
        font-weight: 300;
        text-align: center;
        text-transform: capitalize; 
      }

      p,
      ul,
      ol {
        font-family: sans-serif;
        font-size: 14px;
        font-weight: normal;
        margin: 0;
        margin-bottom: 15px; 
      }
        p li,
        ul li,
        ol li {
          list-style-position: inside;
          margin-left: 5px; 
      }

      a {
        color: #3498db;
        text-decoration: underline; 
      }

      /* -------------------------------------
          BUTTONS
      ------------------------------------- */
      .btn {
        box-sizing: border-box;
        width: 100%; }
        .btn > tbody > tr > td {
          padding-bottom: 15px; }
        .btn table {
          width: auto; 
      }
        .btn table td {
          background-color: #ffffff;
          border-radius: 5px;
          text-align: center; 
      }
        .btn a {
          background-color: #ffffff;
          border: solid 1px #3498db;
          border-radius: 5px;
          box-sizing: border-box;
          color: #3498db;
          cursor: pointer;
          display: inline-block;
          font-size: 14px;
          font-weight: bold;
          margin: 0;
          padding: 12px 25px;
          text-decoration: none;
          text-transform: capitalize; 
      }

      .btn-primary table td {
        background-color: #3498db; 
      }

      .btn-primary a {
        background-color: #3498db;
        border-color: #3498db;
        color: #ffffff; 
      }

      /* -------------------------------------
          OTHER STYLES THAT MIGHT BE USEFUL
      ------------------------------------- */
      .last {
        margin-bottom: 0; 
      }

      .first {
        margin-top: 0; 
      }

      .align-center {
        text-align: center; 
      }

      .align-right {
        text-align: right; 
      }

      .align-left {
        text-align: left; 
      }

      .clear {
        clear: both; 
      }

      .mt0 {
        margin-top: 0; 
      }

      .mb0 {
        margin-bottom: 0; 
      }

      .preheader {
        color: transparent;
        display: none;
        height: 0;
        max-height: 0;
        max-width: 0;
        opacity: 0;
        overflow: hidden;
        mso-hide: all;
        visibility: hidden;
        width: 0; 
      }

      .powered-by a {
        text-decoration: none; 
      }

      hr {
        border: 0;
        border-bottom: 1px solid #f6f6f6;
        margin: 20px 0; 
      }

      /* -------------------------------------
          RESPONSIVE AND MOBILE FRIENDLY STYLES
      ------------------------------------- */
      @media only screen and (max-width: 620px) {
        table.body h1 {
          font-size: 28px !important;
          margin-bottom: 10px !important; 
        }
        table.body p,
        table.body ul,
        table.body ol,
        table.body td,
        table.body span,
        table.body a {
          font-size: 16px !important; 
        }
        table.body .wrapper,
        table.body .article {
          padding: 10px !important; 
        }
        table.body .content {
          padding: 0 !important; 
        }
        table.body .container {
          padding: 0 !important;
          width: 100% !important; 
        }
        table.body .main {
          border-left-width: 0 !important;
          border-radius: 0 !important;
          border-right-width: 0 !important; 
        }
        table.body .btn table {
          width: 100% !important; 
        }
        table.body .btn a {
          width: 100% !important; 
        }
        table.body .img-responsive {
          height: auto !important;
          max-width: 100% !important;
          width: auto !important; 
        }
      }

      /* -------------------------------------
          PRESERVE THESE STYLES IN THE HEAD
      ------------------------------------- */
      @media all {
        .ExternalClass {
          width: 100%; 
        }
        .ExternalClass,
        .ExternalClass p,
        .ExternalClass span,
        .ExternalClass font,
        .ExternalClass td,
        .ExternalClass div {
          line-height: 100%; 
        }
        .apple-link a {
          color: inherit !important;
          font-family: inherit !important;
          font-size: inherit !important;
          font-weight: inherit !important;
          line-height: inherit !important;
          text-decoration: none !important; 
        }
        #MessageViewBody a {
          color: inherit;
          text-decoration: none;
          font-size: inherit;
          font-family: inherit;
          font-weight: inherit;
          line-height: inherit;
        }
        .btn-primary table td:hover {
          background-color: #34495e !important; 
        }
        .btn-primary a:hover {
          background-color: #34495e !important;
          border-color: #34495e !important; 
        } 
      }

    </style>
  </head>
  <body>
    <span class="preheader">This is preheader text. Some clients will show this text as a preview.</span>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body">
      <tr>
        <td>&nbsp;</td>
        <td class="container">
          <div class="content">

            <!-- START CENTERED WHITE CONTAINER -->
            <table role="presentation" class="main">
              <tr>
                <td class="wrapper">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                        <p><h1 style="font-style:strong;">ВІНЬКОВЕЦЬКИЙ КОМУНСЕРВІС</h1></p>
                        <p>Код для активації особистого кабінету:</p>
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary">
                          <tbody>
                            <tr>
                              <td align="left">
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                  <tbody>
                                    <tr>
                                      <td> <a target="_blank">${code}</a> </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <p></p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

            <!-- END MAIN CONTENT AREA -->
            </table>

</div></td> <td>&nbsp;</td> </tr></table> </body></html>`
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