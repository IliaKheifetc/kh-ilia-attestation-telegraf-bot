const axios = require("axios");

class BaseSource {
  constructor(baseUrl, token) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  request() {}

  get(url, config = {}) {
    console.log("url", url);
    console.log("this.token", this.token);

    return axios.get(url, {
      ...config,
      headers: {
        Authorization: `OAuth ${this.token}`
      }
    });
  }

  post(url, data, config = {}) {
    return axios.post(url, data, config);
  }
}

module.exports = BaseSource;
