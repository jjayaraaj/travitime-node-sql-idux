const express = require("express");

const tourCtrl = require("./../controllers/tour");

const router = express.Router();

router.post("/create", tourCtrl.createNewTour);
router.get("/list", tourCtrl.getAllTours);

module.exports = router;
