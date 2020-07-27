const WizardScene = require("telegraf/scenes/wizard");
const Extra = require("telegraf/extra");
const Composer = require("telegraf/composer");
const { capitalize } = require("lodash");
const qs = require("qs");
const moment = require("moment");
const pug = require("pug");
const MetrikaAPI = require("../yandex_metrika/dataSource");

// constants
const {
  COUNTER_ID,
  REPORTS,
  TIME_INTERVALS
} = require("../constants/yandexMetrika");
const { YANDEX_TIME_INTERVAL_FORMAT } = require("../constants/moment");

const getQueryString = params => {
  let {
    dataPresentationForm,
    date1 = moment()
      .subtract(7, "days")
      .format(YANDEX_TIME_INTERVAL_FORMAT),
    date2 = moment().format(YANDEX_TIME_INTERVAL_FORMAT),
    timeIntervalName,
    metrics = ["ym:s:visits", "ym:s:users"].toString(),
    dimensions
  } = params;
  dimensions = dimensions || [`ym:s:datePeriod<group>`].toString();
  const dataPresentationFormQsParam = dataPresentationForm
    ? `/${dataPresentationForm}`
    : "";

  const queryString = qs.stringify({
    ids: COUNTER_ID,
    metrics,
    dimensions,
    group: timeIntervalName,
    date1,
    date2
  });

  return `${dataPresentationFormQsParam}?${queryString}`;
};

const getTabularData = (data, name) => {
  return data.data
    .map(({ dimensions, metrics }) => ({
      datesRange: `${dimensions[0].from} - ${dimensions[0].to}`,
      metricsValues: metrics
        .map(arr => arr.filter(Boolean))
        .reduce((metrics, metricValue) => [...metrics, ...metricValue], [])
    }))
    .map(item => ({ ...item, name }));
};

const createTable = table => {
  const ROW_MAX_LENGTH = 30;
  let tableHeader = table.headers.reduce(
    (acc, item) => acc + `|  ${item}  |`,
    ""
  );

  const tableBody = table.data.reduce((acc, item) => {
    return (
      acc +
      `|  ${item.name}  |  ${item.datesRange}  |  ${item.metricsValues.join(
        ", "
      )}  |\n`
    );
  }, "");

  return `<pre>${tableHeader}\n${tableBody}</pre>`;
};

const showReportTypeSelector = ctx => {
  ctx.reply(
    `<b>Choose report:</b>`,
    Extra.HTML().markup(m =>
      m.inlineKeyboard([
        ...REPORTS.map(dataReportName =>
          m.callbackButton(dataReportName, dataReportName)
        ),
        m.callbackButton("Some stuff", "Some stuff")
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

  //const { text } = ctx.update.message || {};
  //const { data: timeIntervalName } = ctx.update.callback_query || {};

  console.log("ctx.update", JSON.stringify(ctx.update));
  //console.log("timeIntervalName", timeIntervalName);
  console.log("ctx.wizard.state", ctx.wizard.state);

  const {
    dataReportParams: { date1, date2, reportName, timeIntervalName },
    metrikaAccessToken
  } = ctx.wizard.state;

  switch (reportName) {
    case "Visitors":
      const mertikaAPI = new MetrikaAPI(metrikaAccessToken);
      const queryString = getQueryString({
        date1,
        date2,
        dataPresentationForm: "bytime",
        timeIntervalName
      });

      const data = await mertikaAPI.requestVisitors(queryString);

      const tabularData = getTabularData(data, "Визиты и посетители");

      // const compiledFunction = pug.compileFile(
      //   __dirname + "/../views/report.pug"
      // );

      ctx.reply(`data ${JSON.stringify(data)}`);
      const table = createTable({
        data: tabularData,
        headers: ["Метрики", "Даты", "Значения"]
      });
      console.log(table);
      ctx.replyWithHTML(table, { parse_mode: "HTML" });
      break;
    default:
      ctx.reply("The specified report is not supported");
  }

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
