const WizardScene = require("telegraf/scenes/wizard");
const apolloClient = require("../apolloClient");
const { getTranslations } = require("../graphqlOpreations");

const translationScene = new WizardScene(
  "translation",
  ctx => {
    ctx.reply("enter a source language");
    return ctx.wizard.next();
  },
  ctx => {
    console.log("ctx", ctx);

    const { text } = ctx.update.message || {};

    ctx.wizard.state.translationData = {
      sourceLanguage: text
    };

    console.log(
      "ctx.wizard.state.translationData",
      ctx.wizard.state.translationData
    );

    ctx.reply("enter a target language");

    return ctx.wizard.next();
  },
  ctx => {
    try {
      console.log("ctx", ctx);

      const { text } = ctx.update.message || {};

      ctx.wizard.state.translationData.targetLanguage = text;

      ctx.reply("enter text to translate");

      console.log(
        "ctx.wizard.state.translationData",
        ctx.wizard.state.translationData
      );

      return ctx.wizard.next();
    } catch (e) {
      console.log("Error when writing target language into state", e);
    }
  },
  async ctx => {
    try {
      const { text } = ctx.update.message || {};

      ctx.wizard.state.translationData.text = text;

      try {
        const response = await apolloClient.query({
          query: getTranslations,
          variables: { ...ctx.wizard.state.translationData }
        });
        const {
          data: {
            translations: { primaryTranslation, translations }
          }
        } = response;

        const concatenatedTranslationsTexts = translations.reduce(
          (acc, text) => acc + `\n${text}`,
          ""
        );

        ctx.reply(
          `Primary translation: ${primaryTranslation}\nOther translations:${concatenatedTranslationsTexts}`
        );
      } catch (e) {
        ctx.reply("Error occurred when fetching translations");
        console.error("Error occurred when fetching translations", e);
      }

      return ctx.scene.leave();
    } catch (e) {
      console.log("Error when writing text to translate into state", e);
    }
  }
);

module.exports = translationScene;
