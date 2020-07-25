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

        const data = await mertikaAPI.requestVisitors({
          dataPresentationForm: "bytime",
          timeIntervalName
        });

        return ctx.reply(`data ${JSON.stringify(data)}`);
      default:
        ctx.reply("The specified report is not supported");
    }

    //return ctx.wizard.next();
    return ctx.scene.leave();
  }
);

module.exports = yandexMetrikaScene;
