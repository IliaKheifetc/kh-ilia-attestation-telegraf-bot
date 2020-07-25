const axios = require("axios");
const qs = require("qs");
const fs = require("fs").promises;
const BaseSource = require("../BaseSource");
const { METRIKA_BASE_URL } = require("../constants/apiEndpoints");

class MetrikaAPI extends BaseSource {
  constructor(token) {
    super(METRIKA_BASE_URL, token);
  }

  async requestVisitors(queryStringParams) {
    const VISITS_AND_VISITORS_COUNT_URL = `${this.baseUrl}${queryStringParams}`;

    try {
      const { data } = await this.get(VISITS_AND_VISITORS_COUNT_URL);

      console.log("requestVisitors data", JSON.stringify(data));

      return data;
    } catch (e) {
      console.error("Error occurred when fetching visits");
      return null;
    }
  }
}

module.exports = MetrikaAPI;
