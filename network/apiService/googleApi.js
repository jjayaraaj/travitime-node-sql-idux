// import { axiosClient } from "../apiClient";
const axiosClient = require("../apiClient");
const verifyRecaptchaToken = function (payLoad){
    console.log('XXXXXXXXXX');
    console.log(payLoad);
    return axiosClient.post('/recaptcha/api/siteverify', payLoad);
}

module.exports = {
    verifyRecaptchaToken
};