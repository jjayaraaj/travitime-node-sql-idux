const { Sequelize } = require("sequelize");
const jwt = require("jsonwebtoken");

const sequelize = require("../util/database");

// Operator.init({

// });

const ToursModel = sequelize.define("tours", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },

  tourName: {
    type: Sequelize.STRING,
    // allowNull: false,
  },
  startDate: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  endDate: {
    type: Sequelize.STRING,
    // allowNull: false,
  },
  country: Sequelize.STRING,
  noOfDays: Sequelize.STRING,
  travelMode: {
    type: Sequelize.STRING,
    // allowNull: false,
  },
  natureOfTravel: {
    type: Sequelize.STRING,
    // allowNull: false,
  },
  isActive: { type: Sequelize.INTEGER, defaultValue: 0 },
  uniqueTourId: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  isMulticityTravel: { type: Sequelize.INTEGER, defaultValue: 0 }
});


module.exports = ToursModel;
