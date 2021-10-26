const Joi = require("joi");
const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const MailConfig = require('../email/emailClient');
const hbs = require('nodemailer-express-handlebars');

const asyncMiddleware = require("../middleware/asyncMiddleware");
const operatorMiddleware = require("../middleware/operator");
const TravelOperator = require("./../models/travel-operators");

const { ErrorHandler } = require("./../util/error");
const sequelize = require("../util/database");
const operator = require("../middleware/operator");

const googleApiSrv = require("../network/apiService/googleApi");

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
    const recaptchaToken = req.body.recaptchaToken;
    const params={
      response : recaptchaToken,
      secret : "6LdYm8UcAAAAABw1w9IUaNMIf2BLeJnUGFpe2SMz"
    }
    const postBody = new URLSearchParams(params);
    const recaptchaRes = await googleApiSrv.verifyRecaptchaToken(postBody);
    console.log('AAAAAAAAAAAAAAA');
    console.log(recaptchaRes);
    if(!(recaptchaRes.data.success))
      throw new ErrorHandler(
        400,
        "Google reCaptcha failed"
      );
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
      sendActivationMail({
        op_email : email,
        op_name:name,
        op_otp: otp
      });

      res.status(200).send({
        // id: userInsert.id,
        // email: userInsert.email,
        // token: token,
        // expiresIn: 7200,
        // role: "operator",

        message: "Account Created",
      });
    }).then((result) => {
      console.log("DDDDDDDDDDDDDD");
      console.log(result);
   }).catch((e) => {
    console.log("EEEEEEEEEEEEE");
    console.log(e);
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
    recaptchaToken: Joi.string().required(),
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
function sendActivationMail(mail_data){
  const gmailTransport = MailConfig.GmailTransport;
  MailConfig.ViewOption(gmailTransport,hbs);
  let HelperOptions = {
    from: '"Travitime" <noreply@goidux.com>',
    to: mail_data.op_email,
    subject: 'OTP for your Travitime sign-in',
    template: 'op_send_acc_activation_code',
    context: {
      operator_name:mail_data.op_name,
      activation_code: mail_data.op_otp
    }
  };
  gmailTransport.sendMail(HelperOptions, (error,info) => {
    if(error) {
      console.log("account activation email is NOT sent");
      console.log(error);
    }
    else{
      console.log("account activation email is sent");
      // console.log(info);
    }
  });
}
    