const express = require("express");
const { loginCtrl } = require("./../controllers/auth");

const router = express.Router();

router.post("/operator", loginCtrl);

module.exports = router;
