const lineChartSpec = require("../vega_specs/line_chart.spec.json");
const pieChartSpec = require("../vega_specs/pie_chart.spec.json");

const TIME_INTERVALS = {
  day: "day",
  week: "week",
  month: "month",
  quarter: "quarter",
  year: "year"
};

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
    metrics: ["ym:s:users"],
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
  [REPORTS.visitors]: ["#", "Даты", "Значения"],
  [REPORTS.newVisitors]: ["#", "Даты", "Значения"],
  [REPORTS.browsers]: ["#", "Браузер", "Значения"]
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
