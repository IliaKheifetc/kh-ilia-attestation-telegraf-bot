const axios = require("axios");
const qs = require("qs");
const fs = require("fs").promises;
const BaseSource = require("../BaseSource");
const { METRIKA_BASE_URL } = require("../constants/apiEndpoints");

class MetrikaAPI extends BaseSource {
  constructor(token) {
    super(METRIKA_BASE_URL, token);
  }

  async requestVisitors(timeIntervalName) {
    const VISITS_AND_VISITORS__COUNT_URL = `${
      this.baseUrl
    }data?metrics=ym:s:visits,ym:s:users&dimensions=ym:s:datePeriod${timeIntervalName}&ids=50788801`;

    try {
      const {
        data: { data }
      } = await this.get(VISITS_AND_VISITORS__COUNT_URL);

      console.log("requestVisitors data", JSON.stringify(data));

      return data;
    } catch (e) {
      console.error("Error occurred when fetching visits");
      return null;
    }
  }
}

module.exports = MetrikaAPI;
