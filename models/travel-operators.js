const { Sequelize } = require("sequelize");
const jwt = require("jsonwebtoken");

const sequelize = require("../util/database");

// Operator.init({

// });

const TravelOperator = sequelize.define("operator", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },

  username: {
    type: Sequelize.STRING,
    // allowNull: false,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  name: {
    type: Sequelize.STRING,
    // allowNull: false,
  },
  company: Sequelize.STRING,
  address: Sequelize.STRING,
  country: {
    type: Sequelize.STRING,
    // allowNull: false,
  },
  phone: {
    type: Sequelize.INTEGER,
    validate: {
      isNumeric: true,
    },
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  website: Sequelize.STRING,
  otp: { type: Sequelize.INTEGER },
  isActive: { type: Sequelize.INTEGER, defaultValue: 0 },
  uniqueOperatorId: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

TravelOperator.generateToken = function () {
  const token = jwt.sign({ id: this.id }, "nodeSQl_PrivateKey");
  return token;
};

module.exports = TravelOperator;
