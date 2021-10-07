const { Sequelize } = require("sequelize");
const sequelize = require("../util/database");

const TravelOtp = Sequelize.define("operatorotp", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
});
