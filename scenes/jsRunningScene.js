const WizardScene = require("telegraf/scenes/wizard");

const translationScene = new WizardScene(
  "run_js",
  ctx => {
    ctx.reply("enter some js code");
    return ctx.wizard.next();
  },
  ctx => {
    console.log("ctx", ctx);
    const { text: codeString } = ctx.update.message;

    console.log("codeString", codeString);

    let loggedData = [];
    const log = (...args) => {
      loggedData.push(args);
    };

    try {
      const result = eval(codeString);

      ctx.reply(`Result: ${result}`);
      ctx.reply(
        `Logs: ${loggedData.reduce((acc, item) => {
          return acc + `${item}\n`;
        }, "")}`
      );
    } catch (e) {
      ctx.reply(`Error occurred: ${e}`);
    }

    return ctx.scene.leave();
  }
);

module.exports = translationScene;
