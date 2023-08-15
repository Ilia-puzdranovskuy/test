const express = require("express");
const router = express.Router();

let singController = require("../controllers/sing");


let personalAccountController = require("../controllers/personalAccountController");

router.post("/singup",singController.singup)

router.post("/singin",singController.singin)

router.post("/activate-web-account",singController.activateWebAccount)

router.post("/forgot-password-email",singController.forgotPasswordEmail);

router.post("/forgot-password-code",singController.forgotPasswordCode);

router.post("/new-password",singController.newPassword);
///pesonal account

router.post("/personal-account/new-readings",personalAccountController.newReadings);

router.post("/personal-account/add-persAcWeb",personalAccountController.addPersAcWeb);


module.exports = router;


