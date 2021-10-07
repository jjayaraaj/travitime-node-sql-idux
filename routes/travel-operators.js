const express = require("express");

const travelOperatorCtrl = require("./../controllers/travel-operator");

const router = express.Router();

router.post("/create", travelOperatorCtrl.travelRegisterCtrl);
router.post("/activate", travelOperatorCtrl.activateCtrl);

module.exports = router;
