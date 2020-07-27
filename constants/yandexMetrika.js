const TIME_INTERVALS = {
  day: "day",
  week: "week",
  month: "month",
  quarter: "quarter",
  year: "year"
};

const REPORTS = { visitors: "Visitors", newVisitors: "New visitors" };

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
  }
};

const TABLE_LABELS_BY_REPORT_NAME = {
  [REPORTS.visitors]: "Посетители и визиты",
  [REPORTS.newVisitors]: "Новые посетители"
};

module.exports = {
  COUNTER_ID,
  DEFAULT_VARIABLES,
  REPORTS,
  TABLE_LABELS_BY_REPORT_NAME,
  TIME_INTERVALS,
  VARIABLES_BY_REPORT_NAME
};
