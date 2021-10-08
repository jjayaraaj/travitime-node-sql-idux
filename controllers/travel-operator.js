const Joi = require("joi");
const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const asyncMiddleware = require("../middleware/asyncMiddleware");
const operatorMiddleware = require("../middleware/operator");
const TravelOperator = require("./../models/travel-operators");

const { ErrorHandler } = require("./../util/error");
const sequelize = require("../util/database");
const operator = require("../middleware/operator");

exports.travelRegisterCtrl_old = [
  asyncMiddleware(async (req, res, next) => {
    const { error } = travelOperatorValidation(req.body);
    if (error) throw new ErrorHandler(400, error.details[0].message);
    console.log("asdasad");

    let user = TravelOperator.findOne({
      where: {
        email: email,
      },
    });

    if (user)
      throw new ErrorHandler(
        400,
        "Email has already taken. Please try forgot password."
      );

    // const {
    //   username,
    //   password,
    //   name,
    //   company,
    //   address,
    //   country,
    //   phone,
    //   email,
    //   website,
    // } = req.body;

    const username = req.body.username;
    const password = req.body.password;
    const name = req.body.name;
    const company = req.body.company;
    const address = req.body.address;
    const country = req.body.country;
    const phone = req.body.phone;
    const email = req.body.email;
    const website = req.body.website;

    let travelOperator = await TravelOperator.create({
      username: username,
      password: password,
      name: name,
      company: company,
      address: address,
      country: country,
      phone: phone,
      email: email,
      website: website,
    });

    console.log(travelOperator);

    if (!travelOperator) throw new ErrorHandler(404, "Invalid Query");

    res.status(200).send("created");

    //res.header("authorization", "jshfjknlsd").send(travelOperator);
  }),
];

exports.travelRegisterCtrl = [
  asyncMiddleware(async (req, res, next) => {
    const { error } = validation(req.body);
    if (error) throw new ErrorHandler(400, error.details[0].message);

    const email = req.body.email;
    const password = req.body.password;
    const phone = req.body.phone;
    const company = req.body.company;
    const name = req.body.name;
    // res.send(req.body.email);
    // return;
    const user = await TravelOperator.findOne({
      where: {
        email: email,
      },
    });

    if (user)
      throw new ErrorHandler(
        400,
        "Email has already taken. Please try forgot password."
      );

    const otp = otpGenerator.generate(6, {
      upperCase: false,
      specialChars: false,
      alphabets: false,
      digits: true,
    });

    const uniqueCode = otpGenerator.generate(6, {
      upperCase: false,
      specialChars: false,
      alphabets: true,
      digits: true,
    });

    const salt = await bcrypt.genSalt(10);
    const saltPass = await bcrypt.hash(password, salt);

    await sequelize.transaction(async (transaction) => {
      const userInsert = await TravelOperator.create(
        {
          name,
          email,
          password: saltPass,
          phone,
          company,
          otp: otp,
          uniqueOperatorId: uniqueCode,
        },
        { transaction: transaction }
      );

      // console.log(userInsert);

      // const token = jwt.sign(
      //   { id: userInsert.id, email: userInsert.email, role: "operator" },
      //   process.env.JWT_KEY
      // );

      // req.session.operatorId = userInsert.id;

      if (!userInsert) throw new ErrorHandler(400, "Invalid Query");

      //req.session.operator = userInsert;
      //res.status(200).send("created");
      //create reusable transporter object using the default SMTP transport
      let transporter = nodemailer.createTransport({
        //host: 'mail.travitime.com',
        service: "gmail",
        port: 25,
        auth: {
          user: "xxxx@gmail.com",
          pass: "xxxxxxx",
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      const message = {
        from: "noreply@goidux.com", // Sender address
        to: email, // List of recipients
        subject: "OTP for your Travitime sign-in", // Subject line
        text: `Please use the otp ${otp}`, // Plain text body
      };

      let sendMsg;
      transporter.sendMail(message, function (err, info) {
        if (err) {
          console.log("error", err);
          //sendMsg = err.code;
          sendMsg =
            "Your account has been created unexpected error occur in creating the activation key please try to activate your account, sorry for the inconvenience";
        } else {
          sendMsg = info;
        }
      });

      res.status(200).send({
        // id: userInsert.id,
        // email: userInsert.email,
        // token: token,
        // expiresIn: 7200,
        // role: "operator",

        message: "Account Created",
      });
    });
  }),
];

exports.activateCtrl = [
  operatorMiddleware,
  asyncMiddleware(async (req, res, next) => {
    const { email } = req.body;

    // const user = await operator.findOne({
    //   where: {
    //     id: decodedToken.id,
    //     otp: decodedToken.otp,
    //   },
    //   //attributes: ["id", "email"],
    // });

    const operator = await TravelOperator.findOne({
      where: {
        email: email,
        // otp: decodedToken.otp,
      },
      //attributes: ["id", "email"],
    });

    if (!operator || operator.isActive === 1)
      return res
        .status(400)
        .send("Not a valid token or already account has been activated");

    operator.isActive = 1;
    operator.otp = 0;
    operator.save();

    // console.log("activate", req.session.operator);
    res.status(200).send({
      message: "activated",
      code: 1,
    });
  }),
];

function validation(message) {
  let Schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required().min(6),
    phone: Joi.number().required(),
    company: Joi.string().required(),
    name: Joi.string().required(),
  });

  return Schema.validate(message);
}

function travelOperatorValidation(message) {
  let Schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required().min(6),
    name: Joi.string(),
    company: Joi.string(),
    address: Joi.string(),
    country: Joi.string(),
    phone: Joi.number().required(),
    email: Joi.string().email().required(),
    website: Joi.string(),
  });

  return Schema.validate(message);
}
