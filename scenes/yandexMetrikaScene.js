const WizardScene = require("telegraf/scenes/wizard");
const Extra = require("telegraf/extra");
const Composer = require("telegraf/composer");
const { capitalize } = require("lodash");
const qs = require("qs");
const moment = require("moment");
const MetrikaAPI = require("../yandex_metrika/dataSource");
const { COUNTER_ID } = require("../constants/yandexMetrika");
const { YANDEX_TIME_INTERVAL_FORMAT } = require("../constants/moment");

// constants
const { REPORTS, TIME_INTERVALS } = require("../constants/yandexMetrika");

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
    metrics,
    dimensions,
    date1,
    date2
  });

  return `${dataPresentationFormQsParam}?${queryString}`;
};

const dateSelectionHandler = new Composer();

dateSelectionHandler.action("Calendar", ctx => {
  console.log("dateSelectionHandler ");
  console.log("dateSelectionHandler ctx", ctx);

  const { calendar, dataReportParams } = ctx.wizard.state;
  // calendar.setDateListener((context, date) => {
  //   console.log("setDateListener date", date);
  //
  //   context.reply(date);
  //   if (!dataReportParams.date1) {
  //     dataReportParams.date1 = date;
  //     context.reply("Select end date", calendar.getCalendar());
  //   } else if (!dataReportParams.date2) {
  //     dataReportParams.date2 = date;
  //     return ctx.wizard.next();
  //   }
  //
  //   console.log("ctx.wizard.state", ctx.wizard.state);
  // }, dateSelectionHandler);

  ctx.reply("Select start date", calendar.getCalendar());
  console.log("ctx.wizard", ctx.wizard);

  //return ctx.wizard.back();
  return ctx.wizard.selectStep(ctx.wizard.cursor);

  // return ctx.wizard.next();
});

dateSelectionHandler.action(/calendar-telegram-date-[\d-]+/g, ctx => {
  const { state } = ctx.wizard;
  // console.log("onDateSelected");
  let date = ctx.match[0].replace("calendar-telegram-date-", "");
  // console.log("onDateSelected date", date);

  return ctx.answerCbQuery().then(() => {
    console.log("context answerCbQuery then");

    ctx.reply(date);
    if (!state.dataReportParams || !state.dataReportParams.date1) {
      state.dataReportParams = { date1: date };

      //context.reply("Select end date", calendar.getCalendar());
    } else if (!state.dataReportParams.date2) {
      state.dataReportParams.date2 = date;
      return ctx.wizard.next();
    }
  });
});

dateSelectionHandler.action(/calendar-telegram-prev-[\d-]+/g, context => {
  const { calendar, dataReportParams } = context.wizard.state;
  let dateString = context.match[0].replace("calendar-telegram-prev-", "");
  console.log("dateString", dateString);

  let date = new Date(dateString);
  date.setMonth(date.getMonth() - 1);

  console.log("date", date);

  let prevText = context.callbackQuery.message.text;
  return context
    .answerCbQuery()
    .then(() => context.editMessageText(prevText, calendar.getCalendar(date)));
});

dateSelectionHandler.action(/calendar-telegram-next-[\d-]+/g, context => {
  const { calendar, dataReportParams } = context.wizard.state;
  const {
    message_id: messageId,
    chat: { id: chatId }
  } = context.update.callback_query.message;

  let dateString = context.match[0].replace("calendar-telegram-next-", "");

  let date = new Date(dateString);
  date.setMonth(date.getMonth() + 1);

  let prevText = context.callbackQuery.message.text;
  return context
    .answerCbQuery()
    .then(() => context.editMessageText(prevText, calendar.getCalendar(date)));
});

dateSelectionHandler.action(/calendar-telegram-ignore-[\d\w-]+/g, context =>
  context.answerCbQuery()
);

dateSelectionHandler.use(ctx => {
  console.log("use middleware");
  console.log("ctx", ctx);
});

const yandexMetrikaScene = new WizardScene(
  "yandexMetrika",
  ctx => {
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
  },
  async ctx => {
    console.log("ctx", ctx);

    //const { text } = ctx.update.message || {};
    const { data: reportName } = ctx.update.callback_query || {};

    ctx.wizard.state.dataReportParams = {
      reportName
    };

    console.log("ctx.update", JSON.stringify(ctx.update));

    console.log("reportName", reportName);

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
  },
  dateSelectionHandler,
  async ctx => {
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

        return ctx.reply(`data ${JSON.stringify(data)}`);
      default:
        ctx.reply("The specified report is not supported");
    }

    //return ctx.wizard.next();
    return ctx.scene.leave();
  }
);

yandexMetrikaScene.use;

module.exports = yandexMetrikaScene;
