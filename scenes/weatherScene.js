const Scene = require("telegraf/scenes/base");
const apolloClient = require("../apolloClient");
const { getCurrentWeatherInfo } = require("../graphqlOpreations");

const weatherScene = new Scene("weather");
weatherScene.enter(ctx => ctx.reply("enter a city name"));

weatherScene.on("text", async ctx => {
  ctx.webhookReply = false;
  const { text } = ctx.update.message || {};

  console.log("ctx", ctx);
  console.log("ctx.update", ctx.update);
  console.log("ctx.update.message", ctx.update.message);
  if (text.toLowerCase().includes("leave")) {
    ctx.scene.leave();
    return;
  }

  // if (cityName === undefined) {
  //   ctx.reply("Please specify a city name after the /weather command");
  //   return;
  // }
  try {
    const {
      data: { currentWeatherInfo }
    } = await apolloClient.query({
      query: getCurrentWeatherInfo,
      variables: { cityName: text }
    });

    const {
      description,
      icon,
      realTemperature,
      feelsLikeTemperature
    } = currentWeatherInfo;

    const iconPath = `./static/icons/${icon}.png`;
    await ctx.replyWithPhoto({ source: iconPath });

    await ctx.reply(
      `Temperature: ${realTemperature}\nFeels like temperature: ${feelsLikeTemperature}\n${description}`
    );

    ctx.replyWithHTML("enter a city name or enter <b>/leave</b> command", {
      parse_mode: "HTML"
    });
  } catch (e) {
    console.error("Error occurred when fetching weather info", e);
  }
});

weatherScene.leave(ctx => ctx.reply("exiting weatherScene"));

module.exports = weatherScene;
