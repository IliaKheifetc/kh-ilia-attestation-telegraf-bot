const fs = require("fs");
const WizardScene = require("telegraf/scenes/wizard");
const Extra = require("telegraf/extra");
const Composer = require("telegraf/composer");
const { capitalize } = require("lodash");

//const MetrikaAPI = require("../yandex_metrika/dataSource");
const apolloClient = require("../apolloClient");
const { getReportData } = require("../graphqlOpreations");
const {
  getLineChartDataValues,
  getPieChartDataValues,
  createTable,
  sortByDate,
  sortByMetricValueDesc
} = require("../utils/yandexMetrika");
const { createDiagram } = require("../diagramBuilder");

// constants
const {
  DEFAULT_VARIABLES,
  REPORTS,
  TABLE_HEADER_BY_REPORT_NAME,
  TABLE_LABELS_BY_REPORT_NAME,
  TIME_INTERVALS,
  VARIABLES_BY_REPORT_NAME
} = require("../constants/yandexMetrika");

const compose = (f1, f2) => data => f1(f2(data));

const VALUES_MAKERS_BY_REPORT_NAME = {
  [REPORTS.visitors]: getLineChartDataValues,
  [REPORTS.newVisitors]: getLineChartDataValues,
  [REPORTS.browsers]: compose(
    sortByMetricValueDesc,
    getPieChartDataValues
  )
};

const SORT_BY_REPORT_NAME = {
  [REPORTS.visitors]: sortByDate,
  [REPORTS.newVisitors]: sortByDate,
  [REPORTS.browsers]: sortByMetricValueDesc
};

const showReportTypeSelector = ctx => {
  const { metrikaAccessToken } = ctx.wizard.state;
  if (!metrikaAccessToken) {
    ctx.replyWithHTML(
      "Please authorize using <b>/yandex_metrika_auth</b> command",
      { parse_mode: "HTML" }
    );
    ctx.scene.leave();
    return;
  }

  ctx.reply(
    `<b>Choose report:</b>`,
    Extra.HTML().markup(m =>
      m.inlineKeyboard([
        ...Object.values(REPORTS).map(dataReportName =>
          m.callbackButton(dataReportName, dataReportName)
        )
      ])
    )
  );

  return ctx.wizard.next();
};

const saveReportTypeAndShowTimeIntervalSelector = async ctx => {
  console.log("ctx", ctx);

  const { data: reportName } = ctx.update.callback_query || {};

  ctx.wizard.state.dataReportParams = {
    reportName
  };

  //console.log("ctx.update", JSON.stringify(ctx.update));
  //console.log("reportName", reportName);
  await ctx.answerCbQuery();

  ctx.reply(
    `<b>Choose time interval:</b>`,
    Extra.HTML().markup(m =>
      m.inlineKeyboard([
        ...Object.keys(TIME_INTERVALS).map(timeIntervalName =>
          m.callbackButton(capitalize(timeIntervalName), timeIntervalName)
        )
      ])
    )
  );

  return ctx.wizard.next();
};

const saveTimeIntervalAndShowCalendar = async ctx => {
  const { data: timeIntervalName } = ctx.update.callback_query || {};
  const { calendar } = ctx.wizard.state;
  ctx.wizard.state.dataReportParams.timeIntervalName = timeIntervalName;

  await ctx.answerCbQuery();

  ctx.reply("Select start date", calendar.getCalendar());
  return ctx.wizard.next();
};

const handleDateSelection = new Composer();

handleDateSelection.action(/calendar-telegram-date-[\d-]+/g, async ctx => {
  const { state } = ctx.wizard;
  const { calendar } = state;
  let date = ctx.match[0].replace("calendar-telegram-date-", "");

  await ctx.answerCbQuery();

  if (!state.dataReportParams.date1) {
    console.log("set date1", date);
    state.dataReportParams.date1 = date;
    ctx.reply(date);
    return ctx.reply("Select end date", calendar.getCalendar());
  } else if (!state.dataReportParams.date2) {
    console.log("set date2", date);
    ctx.reply(date);
    state.dataReportParams.date2 = date;
    return ctx.wizard.next();
  }
});

handleDateSelection.action(/calendar-telegram-prev-[\d-]+/g, async context => {
  const { calendar, dataReportParams } = context.wizard.state;
  const dateString = context.match[0].replace("calendar-telegram-prev-", "");

  let date = new Date(dateString);
  date.setMonth(date.getMonth() - 1);

  const prevText = context.callbackQuery.message.text;
  await context.answerCbQuery();
  context.editMessageText(prevText, calendar.getCalendar(date));
});

handleDateSelection.action(/calendar-telegram-next-[\d-]+/g, async ctx => {
  const { calendar, dataReportParams } = ctx.wizard.state;

  const dateString = ctx.match[0].replace("calendar-telegram-next-", "");

  let date = new Date(dateString);
  date.setMonth(date.getMonth() + 1);

  const prevText = ctx.callbackQuery.message.text;
  await ctx.answerCbQuery();
  ctx.editMessageText(prevText, calendar.getCalendar(date));
});

handleDateSelection.action(/calendar-telegram-ignore-[\d\w-]+/g, context =>
  context.answerCbQuery()
);

handleDateSelection.use(ctx => {
  console.log("use middleware");
  console.log("ctx", ctx);
});

const fetchReportData = async ctx => {
  console.log("collect all input and make request");

  console.log("ctx", ctx);

  console.log("ctx.update", JSON.stringify(ctx.update));

  console.log("ctx.wizard.state", ctx.wizard.state);

  const {
    dataReportParams: { date1, date2, reportName, timeIntervalName },
    metrikaAccessToken
  } = ctx.wizard.state;

  const variablesByReportName = VARIABLES_BY_REPORT_NAME[reportName];

  if (!variablesByReportName) {
    return ctx.reply("The specified report is not supported");
  }

  const {
    data: { reportData }
  } = await apolloClient.query({
    query: getReportData,
    variables: {
      ...DEFAULT_VARIABLES,
      ...variablesByReportName,
      date1,
      date2,
      timeIntervalName
    },
    context: {
      headers: {
        authorization: metrikaAccessToken
      }
    }
  });

  if (!reportData) {
    return ctx.reply("Error occurred when getting data, sorry");
  }

  const sort = SORT_BY_REPORT_NAME[reportName];
  const reportRows = sort(reportData.reportRows);

  console.log("sorted reportRows", reportRows);

  //ctx.reply(`reportRows ${JSON.stringify(reportRows)}`);

  const table = createTable({
    tableRows: reportRows,
    headersDict: TABLE_HEADER_BY_REPORT_NAME[reportName],
    name: TABLE_LABELS_BY_REPORT_NAME[reportName]
  });
  console.log(table);
  ctx.replyWithHTML(table, { parse_mode: "HTML" });

  const getValues = VALUES_MAKERS_BY_REPORT_NAME[reportName];
  const chartDataValues = getValues(reportRows);
  console.log("chartDataValues", chartDataValues);
  const fileName = await createDiagram(chartDataValues, reportName);

  ctx.replyWithPhoto({ source: fs.readFileSync(`./${fileName}`) });

  //return ctx.wizard.next();
  return ctx.scene.leave();
};

const yandexMetrikaScene = new WizardScene(
  "yandexMetrika",
  showReportTypeSelector,
  saveReportTypeAndShowTimeIntervalSelector,
  saveTimeIntervalAndShowCalendar,
  handleDateSelection,
  fetchReportData
);

module.exports = yandexMetrikaScene;
