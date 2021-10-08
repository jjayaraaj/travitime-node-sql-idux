const Joi = require("joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const asyncMiddleware = require("../middleware/asyncMiddleware");
const operatorMiddleware = require("../middleware/operator");
const TravelOperator = require("./../models/travel-operators");

const { ErrorHandler } = require("./../util/error");
const sequelize = require("../util/database");

exports.loginCtrl = [
  asyncMiddleware(async (req, res, next) => {
    const { error } = userLoginValidateError(req.body);
    if (error) throw new ErrorHandler(400, error.details[0].message);

    const { email, password } = req.body;
    let operator = await TravelOperator.findOne({
      where: {
        email: email,
      },
    });

    if (!operator) throw new ErrorHandler(400, "Invalid username");

    const validPassword = await bcrypt.compare(password, operator.password);
    if (!validPassword) throw new ErrorHandler(400, "Invalid password");

    if (operator.isActive !== 1) throw new ErrorHandler(400, "activationError");

    const expiresIn = "3600";
    const operatorDetail = {
      id: operator.id,
      email: operator.email,
      name: operator.name,
      expiresIn: expiresIn,
      role: "operator",
      uniqueOperatorId: operator.uniqueOperatorId,
      company: operator.company,
    };

    const token = jwt.sign(operatorDetail, process.env.JWT_KEY);
    operatorDetail.token = token;

    //  console.log("operator detail", operatorDetail);
    res.status(200).send({
      operatorDetail,
    });
  }),
];

function userLoginValidateError(message) {
  let Schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  return Schema.validate(message);
}
