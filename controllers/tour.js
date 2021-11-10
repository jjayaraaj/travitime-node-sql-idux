const Joi = require("joi");
const otpGenerator = require("otp-generator");

const asyncMiddleware = require("../middleware/asyncMiddleware");
const toursMiddleware = require("../middleware/tours");
const ToursModel = require("../models/tours");

const { ErrorHandler } = require("../util/error");
const sequelize = require("../util/database");

const logger = require('../logger/logger')




exports.createNewTour = [
  toursMiddleware,
  asyncMiddleware(async (req, res, next) => {console.log('XXXXXXX');
    const { error } = validation(req.body);
    if (error) throw new ErrorHandler(400, error.details[0].message);
    logger.error('Creating New tour: ', req.body);
    console.log('Creating New tour: ');
    const tourName = req.body.tourName;
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    const country = req.body.country;
    const noOfDays = req.body.noOfDays;
    const travelMode = req.body.travelMode;
    const natureOfTravel = req.body.natureOfTravel;
    const uniqueCode = otpGenerator.generate(6, {
      upperCase: false,
      specialChars: false,
      alphabets: true,
      digits: true,
    });
    await sequelize.transaction(async (transaction) => {
      const tourInsert = await ToursModel.create(
        {
          tourName: tourName,
          startDate: startDate,
          endDate: endDate,
          country: country,
          noOfDays: noOfDays,
          travelMode: travelMode,
          natureOfTravel: natureOfTravel,
          uniqueTourId: uniqueCode,
        },
        { transaction: transaction }
      );
      if (!tourInsert) throw new ErrorHandler(400, "Create Tour Failed");
      res.status(200).send({
        message: "Tour Created",
      });
    }).then((result) => {
      console.log("createNewTour sequelize SUCCESS");
      console.log(result);
   }).catch((e) => {
    console.log("createNewTour sequelize ERROR");
    console.log(e);
   });
  })
];
exports.getAllTours = [
  toursMiddleware,
  asyncMiddleware(async (req, res, next) => {
    console.log('getAllTours Ctrl');
    const tours = await ToursModel.findAll();
    res.status(200).send({
      data: tours,
      status: true
    });
  })
];
function validation(message) {
  let Schema = Joi.object({
    tourName: Joi.string().required().min(4),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    country: Joi.string().required(),
    noOfDays: Joi.number().required(),
    travelMode: Joi.string().required(),
    natureOfTravel: Joi.string().required(),
  });

  return Schema.validate(message);
}

    