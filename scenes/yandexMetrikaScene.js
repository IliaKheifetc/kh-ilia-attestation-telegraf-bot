const WizardScene = require("telegraf/scenes/wizard");
const Extra = require("telegraf/extra");
const { capitalize } = require("lodash");
const MetrikaAPI = require("../yandex_metrika/dataSource");

// constants
const { REPORTS, TIME_INTERVALS } = require("../constants/yandexMetrika");

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
        m.inlineKeyboard(
          Object.keys(TIME_INTERVALS).map(timeIntervalName =>
            m.callbackButton(capitalize(timeIntervalName), timeIntervalName)
          )
        )
      )
    );

    return ctx.wizard.next();
  },
  async ctx => {
    console.log("ctx", ctx);

    //const { text } = ctx.update.message || {};
    const { data: timeIntervalName } = ctx.update.callback_query || {};

    ctx.wizard.state.dataReportParams = {
      reportName: data
    };

    console.log("ctx.update", JSON.stringify(ctx.update));
    console.log("timeIntervalName", timeIntervalName);
    console.log("ctx.wizard.state", ctx.wizard.state);

    // switch (data) {
    //   case "Visitors":
    //     const mertikaAPI = new MetrikaAPI(metrikaAccessToken);
    //
    //     const data = await mertikaAPI.requestVisitors();
    //
    //     return ctx.reply(
    //       `<b>Choose time interval:</b>`,
    //       Extra.HTML().markup(m =>
    //         m.inlineKeyboard([m.urlButton(`Authorize`, authUrl)])
    //       )
    //     );
    // }

    // ctx.wizard.state.translationData = {
    //   sourceLanguage: text
    // };

    // console.log(
    //   "ctx.wizard.state.translationData",
    //   ctx.wizard.state.translationData
    // );

    ctx.reply("choose time interval");

    return ctx.wizard.next();
  }
);

module.exports = yandexMetrikaScene;
