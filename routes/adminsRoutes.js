const express = require("express");
const router = express.Router();

let adminController = require("../controllers/adminController.js");
/// GET
router.get("/",adminController.authGet);

router.get("/main",adminController.mainPage);

router.get("/new-pers-ac",adminController.newPersAc);




/// POST
router.post("/auth",adminController.authPost)

router.post("/serch-persac",adminController.searchPersAc)

router.post("/new-pers-account",adminController.newPersAccountPost)


// control personal accounts

router.get("/readings",adminController.readings);
router.post("/new-reading",adminController.newReading);
router.post("/delete-reading",adminController.deleteReading);

router.get("/paymets-and-accruals",adminController.paymentsAndAccruals);
router.post("/new-payment",adminController.newPayment);
router.post("/delete-payment",adminController.deletePayment);

router.get("/payment-redirect",adminController.redirectPayment);
router.post("/payment-redirect-post",adminController.redirectPaymentPost);

router.get("/meters",adminController.meters);
router.post("/change-meter",adminController.changeMeter);
router.post("/new-meter",adminController.newMeter);
router.post("/delete-meter",adminController.deleteMeter);

router.get("/seals",adminController.seals);
router.post("/new-seal",adminController.newSeal);
router.post("/delete-seal",adminController.deleteSeal);
router.post("/change-seal",adminController.changeSeal);

router.get("/personal-accounts-news",adminController.persAcNews);
router.post("/new-pers-ac-news",adminController.newpersAcNews);
router.post("/activate-pers-ac-news",adminController.activatePersAcNews);
router.post("/deactivate-pers-ac-news",adminController.deactivatePersAcNews);

router.get("/change-information",adminController.changePersAcInformation);
router.post("/change-information",adminController.changePersAcInformationPost);

router.get("/news",adminController.news);
router.post("/new-news",adminController.newNews);
router.post("/activate-news",adminController.activateNews);
router.post("/deactivate-news",adminController.deactivateNews);


router.get("/telegram-news",adminController.telegramNews);
router.post("/new-telegram-news",adminController.telegramNewsPost);


router.get("/personal-mes-telegram",adminController.telegramPersMes);
router.post("/new-personal-mes-telegram",adminController.telegramPersMesPost);


router.post("/close-personal-ac",adminController.closePersAc);
// router.post("/delete-personal-ac",adminController.deletePersAc);

router.get("/audit-payments",adminController.auditPayments);
router.post("/audit-payments-post",adminController.auditPaymentsPost);

router.get("/audit-readings",adminController.auditReadings);
router.post("/audit-readings-post",adminController.auditReadingsPost);

router.get("/accurals",adminController.handAccrual);
router.post("/new-hand-accural-rubbish",adminController.newHandAccuralRubbish);

router.get("/auto-accurals",adminController.autoAccruals);
router.post("/auto-accural-check",adminController.autoAccrualsCheckPost);
router.post("/auto-accurals-post",adminController.autoAccrualsPost);
router.post("/auto-accurals-clear-marks",adminController.autoAccrualsClearMarks);






module.exports = router;