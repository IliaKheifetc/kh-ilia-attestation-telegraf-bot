const WizardScene = require("telegraf/scenes/wizard");
const Extra = require("telegraf/extra");
const Composer = require("telegraf/composer");
const { capitalize } = require("lodash");

//const MetrikaAPI = require("../yandex_metrika/dataSource");
const apolloClient = require("../apolloClient");
const { getReportData } = require("../graphqlOpreations");
const { handleYandexMetrikaAuth } = require("../index");

// constants
const {
  DEFAULT_VARIABLES,
  REPORTS,
  TABLE_LABELS_BY_REPORT_NAME,
  TIME_INTERVALS,
  VARIABLES_BY_REPORT_NAME
} = require("../constants/yandexMetrika");

// const createAddName = reportName => item => ({
//   ...item,
//   name: TABLE_LABELS_BY_REPORT_NAME[reportName]
// });

const createTable = (table, name) => {
  const ROW_MAX_LENGTH = 30;
  let caption = `Метрика: <b>${name}</b>`;
  let tableHeader = table.headers.reduce(
    (acc, item) => acc + `|  ${item}  |`,
    ""
  );

  const tableBody = table.data.reduce((acc, item) => {
    return (
      acc + `|  ${item.datesRange}  |  ${item.metricsValues.join(", ")}  |\n`
    );
  }, "");

  return `<pre>${caption}\n${tableHeader}\n${tableBody}</pre>`;
};

const showReportTypeSelector = ctx => {
  const { metrikaAccessToken } = ctx.wizard.state;
  if (!metrikaAccessToken) {
    ctx.replyWithHTML(
      "Please authorize using <b>/yandex_metrika</b>_auth command",
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

  console.log("ctx.update", JSON.stringify(ctx.update));

  console.log("reportName", reportName);
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

// dateSelectionHandler.action("Calendar", async ctx => {
//
//
//   //return ctx.wizard.selectStep(ctx.wizard.cursor);
// });

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

  console.log("reportData", reportData);
  const reportRows = reportData ? reportData.reportRows : [];

  ctx.reply(`reportRows ${JSON.stringify(reportRows)}`);
  //const addName = createAddName(reportName);
  const table = createTable(
    {
      data: reportRows.map(addName),
      headers: ["Даты", "Значения"]
    },
    TABLE_LABELS_BY_REPORT_NAME[reportName]
  );
  console.log(table);
  ctx.replyWithHTML(table, { parse_mode: "HTML" });

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
