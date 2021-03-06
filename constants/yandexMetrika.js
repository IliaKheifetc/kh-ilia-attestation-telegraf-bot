const { lineChartSpec, pieChartSpec } = require("../vega_specs/index");

// const TIME_INTERVALS = {
//   day: "day",
//   week: "week",
//   month: "month",
//   quarter: "quarter",
//   year: "year"
// };
const TIME_INTERVALS = ["day", "week", "month", "quarter", "year"];

const REPORTS = {
  visitors: "Visitors",
  newVisitors: "New visitors",
  browsers: "Browsers"
};

const COUNTER_ID = 50788801;

const DEFAULT_VARIABLES = {
  dataPresentationForm: "bytime",
  ids: COUNTER_ID
};

const VARIABLES_BY_REPORT_NAME = {
  [REPORTS.visitors]: {
    metrics: ["ym:s:visits", "ym:s:users"],
    dimensions: [`ym:s:datePeriod<group>`]
  },
  [REPORTS.newVisitors]: {
    metrics: ["ym:s:newUsers"],
    dimensions: [`ym:s:datePeriod<group>`]
  },
  [REPORTS.browsers]: {
    metrics: ["ym:s:pageviews"],
    dimensions: ["ym:s:browser"],
    topKeys: 8 // маскимальное количество строк в ответе
  }
};

const TABLE_LABELS_BY_REPORT_NAME = {
  [REPORTS.visitors]: "Посетители и визиты",
  [REPORTS.newVisitors]: "Новые посетители",
  [REPORTS.browsers]: "Браузеры"
};

const TABLE_HEADER_BY_REPORT_NAME = {
  [REPORTS.visitors]: [
    { key: "#", rusName: "#" },
    { key: "datesRange", rusName: "Даты" },
    { key: "metricsValues", rusName: "Значения" }
  ],
  [REPORTS.newVisitors]: [
    { key: "#", rusName: "#" },
    { key: "datesRange", rusName: "Даты" },
    { key: "metricsValues", rusName: "Значения" }
  ],
  [REPORTS.browsers]: [
    { key: "#", rusName: "#" },
    { key: "name", rusName: "Браузер" },
    { key: "metricsValues", rusName: "Значения" }
  ]
};

const REPORTS_CHART_TYPES = {
  [REPORTS.visitors]: lineChartSpec,
  [REPORTS.newVisitors]: lineChartSpec,
  [REPORTS.browsers]: pieChartSpec
};

module.exports = {
  COUNTER_ID,
  DEFAULT_VARIABLES,
  REPORTS,
  REPORTS_CHART_TYPES,
  TABLE_HEADER_BY_REPORT_NAME,
  TABLE_LABELS_BY_REPORT_NAME,
  TIME_INTERVALS,
  VARIABLES_BY_REPORT_NAME
};
