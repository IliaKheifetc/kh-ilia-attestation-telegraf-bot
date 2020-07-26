const WizardScene = require("telegraf/scenes/wizard");
const Extra = require("telegraf/extra");
const Composer = require("telegraf/composer");
const { capitalize } = require("lodash");
const qs = require("qs");
const moment = require("moment");
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
    metrics = ["ym:s:visits", "ym:s:users"],
    dimensions
  } = params;
  dimensions =
    dimensions ||
    (timeIntervalName ? [`ym:s:datePeriod${timeIntervalName}`] : []);
  const dataPresentationFormQsParam = dataPresentationForm
    ? `/${dataPresentationForm}`
    : "";

  const queryString = qs.stringify({
    ids: COUNTER_ID,
    metrics: metrics.join(","),
    dimensions: [`ym:s:datePeriodDay`].join(","),
    date1,
    date2
  });

  return `${dataPresentationFormQsParam}?${queryString}`;
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
        ),
        m.callbackButton(capitalize("Calendar"), "Calendar")
      ])
    )
  );

  return ctx.wizard.next();
};

const dateSelectionHandler = new Composer();

dateSelectionHandler.action("Calendar", async ctx => {
  const { calendar } = ctx.wizard.state;
  await ctx.answerCbQuery();
  ctx.reply("Select start date", calendar.getCalendar());

  //return ctx.wizard.selectStep(ctx.wizard.cursor);
});

dateSelectionHandler.action(/calendar-telegram-date-[\d-]+/g, async ctx => {
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

dateSelectionHandler.action(/calendar-telegram-prev-[\d-]+/g, async context => {
  const { calendar, dataReportParams } = context.wizard.state;
  const dateString = context.match[0].replace("calendar-telegram-prev-", "");

  let date = new Date(dateString);
  date.setMonth(date.getMonth() - 1);

  const prevText = context.callbackQuery.message.text;
  await context.answerCbQuery();
  context.editMessageText(prevText, calendar.getCalendar(date));
});

dateSelectionHandler.action(/calendar-telegram-next-[\d-]+/g, async ctx => {
  const { calendar, dataReportParams } = ctx.wizard.state;

  const dateString = ctx.match[0].replace("calendar-telegram-next-", "");

  let date = new Date(dateString);
  date.setMonth(date.getMonth() + 1);

  const prevText = ctx.callbackQuery.message.text;
  await ctx.answerCbQuery();
  ctx.editMessageText(prevText, calendar.getCalendar(date));
});

dateSelectionHandler.action(/calendar-telegram-ignore-[\d\w-]+/g, context =>
  context.answerCbQuery()
);

dateSelectionHandler.use(ctx => {
  console.log("use middleware");
  console.log("ctx", ctx);
});

const fetchReportData = async ctx => {
  console.log("collect all input and make request");

  console.log("ctx", ctx);

  //const { text } = ctx.update.message || {};
  const { data: timeIntervalName } = ctx.update.callback_query || {};

  console.log("ctx.update", JSON.stringify(ctx.update));
  console.log("timeIntervalName", timeIntervalName);
  console.log("ctx.wizard.state", ctx.wizard.state);

  const {
    dataReportParams: { reportName },
    metrikaAccessToken
  } = ctx.wizard.state;

  switch (reportName) {
    case "Visitors":
      const mertikaAPI = new MetrikaAPI(metrikaAccessToken);
      const queryString = getQueryString({
        dataPresentationForm: "bytime",
        timeIntervalName
      });

      const data = await mertikaAPI.requestVisitors(queryString);

      ctx.reply(`data ${JSON.stringify(data)}`);
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
  dateSelectionHandler,
  fetchReportData
);

module.exports = yandexMetrikaScene;
