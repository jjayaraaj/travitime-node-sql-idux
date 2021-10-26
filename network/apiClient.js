const axios = require('axios');

const axiosClient = axios.create({
    baseURL: `https://www.google.com`,
    headers: {
      'Accept': 'application/json',
    //   'Content-Type': 'application/json'
    }
});

axiosClient.interceptors.response.use(
    function (response) {
        return response;
    }, 
    function (error) {
        let res = error.response;
        console.error("Looks like there was a problem. Status Code: " + res.status);
        return Promise.reject(error);
    }
);
module.exports = axiosClient;
