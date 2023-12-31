const express = require("express");
const router = express.Router();

let personalAccountController = require("../controllers/personalAccountController");

let newsController = require("../controllers/newsController");

router.get("/",(req,res)=>{
    res.render('pages/index');
})

router.get("/singin",(req,res)=>{
    res.render('pages/singin',{errors:""});
})

router.get("/singup",(req,res)=>{
    res.render('pages/singup',{errors:""});
})

router.get("/singup-activate-link",(req,res)=>{
    res.render('pages/singupActivateLink',{email:req.query.email,errors:""});
})

router.get("/forgot-password",(req,res)=>{
    res.render('pages/forgotPasswordEmail',{errors:""});
})

router.get("/tarifs",(req,res)=>{
    res.render('pages/tarifs');
})
router.get("/about",(req,res)=>{
    res.render('pages/about');
})

router.get("/publichna-oferta",(req,res)=>{
    res.render('pages/public_oferta');
})

router.get("/question-and-answers",(req,res)=>{
    res.render('pages/qAndApage');
})




///news

router.get("/news",newsController.getLastNews);

router.get("/all-news",newsController.allNews);

router.get("/detail-news",newsController.detailNews);


//personal accounts
router.get("/personal-account",personalAccountController.entry);

router.get("/personal-account/readings",personalAccountController.readingsPage);

router.get("/personal-account/payments",personalAccountController.payments);

router.get("/personal-account/add-persAc",personalAccountController.addPersAcPage);

// router.get("/personal-account/payments",personalAccountController.calculationPage);




module.exports = router;