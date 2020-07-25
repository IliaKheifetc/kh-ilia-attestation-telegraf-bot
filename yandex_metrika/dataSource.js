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
    const dataPresentationQsParam = dataPresentationForm
      ? `/${dataPresentationForm}`
      : "";
    const VISITS_AND_VISITORS__COUNT_URL = `${
      this.baseUrl
    }${dataPresentationQsParam}?metrics=ym:s:visits,ym:s:users&dimensions=ym:s:datePeriod${timeIntervalName}&ids=${COUNTER_ID}`;

    try {
      const { data } = await this.get(VISITS_AND_VISITORS__COUNT_URL);

      console.log("requestVisitors data", JSON.stringify(data));

      return data;
    } catch (e) {
      console.error("Error occurred when fetching visits");
      return null;
    }
  }
}

module.exports = MetrikaAPI;
