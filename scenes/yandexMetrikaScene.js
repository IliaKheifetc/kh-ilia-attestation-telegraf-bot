const WizardScene = require("telegraf/scenes/wizard");
const Extra = require("telegraf/extra");

// constants
const { REPORTS, TIME_INTERVALS } = require("../constants/yandexMetrika");

const yandexMetrikaScene = new WizardScene(
  "yandexMetrika",
  ctx => {
    ctx.reply(
      `<b>Choose report:</b>`,
      Extra.HTML().markup(m =>
        m.inlineKeyboard([
          ...REPORTS.map(dataReportName => m.callbackButton(dataReportName)),
          m.callbackButton("Some stuff")
        ])
      )
    );

    return ctx.wizard.next();
  },
  ctx => {
    console.log("ctx", ctx);

    const { text } = ctx.update.message || {};

    console.log("text", text);

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
