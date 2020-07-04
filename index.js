const { Telegraf } = require("telegraf");
const session = require("telegraf/session");
const Telegram = require("telegraf/telegram");
const Stage = require("telegraf/stage");
const Scene = require("telegraf/scenes/base");
const WizardScene = require("telegraf/scenes/wizard");
const Markup = require("telegraf/markup");
const axios = require("axios");

const fetch = require("node-fetch");

const { ApolloClient } = require("apollo-client");
const { HttpLink } = require("apollo-link-http");
const { InMemoryCache } = require("apollo-cache-inmemory");

const {
  getCurrentWeatherInfo,
  getTranslations
} = require("./graphqlOpreations");

const client = new ApolloClient({
  link: new HttpLink({
    uri:
      process.env.NODE_ENV === "production"
        ? "https://telegraf-bot-graphql-server.herokuapp.com/ "
        : "http://localhost:4055",
    fetch: fetch
  }),
  cache: new InMemoryCache()
});

const { enter, leave } = Stage;

//const BOT_TOKEN = "1204951589:AAHZj8hJCHf1YyJvKm4Ba8xh6_Cz6dEA3Sg";

// const OPEN_WEATHER_BASE_URL = "http://api.openweathermap.org/data/2.5/weather"; //?q={city name}&appid={your api key}
// const OPEN_WEATHER_API_KEY = "a5ab5ecaa641726e400f2a4c1fa9a9f";
// const CITY_NAME = "Kaluga";
// const OPEN_WEATHER_URL = `${OPEN_WEATHER_BASE_URL}?q=${"London"}&appid=${OPEN_WEATHER_API_KEY}`;
// const ACCU_WEATHER_URL = `http://dataservice.accuweather.com/currentconditions/v1/${CITY_NAME}`;

const GREETINGS = ["man", "bro", "mate", "comrade"];

const WEATHERBIT_KEY = "7a35bcf113274c5da5b570ce3e4a47b7";
const WEATHERBIT_BASE_URL = "https://api.weatherbit.io/v2.0/current";

const GIPHY_API_KEY = "YVsAQADzVJvmOt52rXTtkJXijApmIa7Y";
const GIPHY_BASE_URL = "https://api.giphy.com/v1/gifs/search";

class UrlBuilder {
  constructor({ baseUrl }) {
    this.baseUrl = baseUrl;
  }

  getFullUrl = params => {
    const queryString = Object.keys(params).reduce(
      (queryString, key, index, arr) => {
        if (params[key] === undefined) {
          return queryString;
        }

        queryString += `${key}=${params[key]}`;
        queryString += index < arr.length - 1 ? "&" : "";

        return queryString;
      },
      ""
    );

    return `${this.baseUrl}?${queryString}`;
  };
}

const weatherScene = new Scene("weather");
weatherScene.enter(ctx => ctx.reply("enter a city name"));
//weatherScene.on("text", ctx => ctx.reply(ctx.message.text));

weatherScene.on("text", async ctx => {
  ctx.webhookReply = false;
  const { text } = ctx.update.message || {};

  console.log("ctx", ctx);
  console.log("ctx.update", ctx.update);
  console.log("ctx.update.message", ctx.update.message);
  if (text.toLowerCase().includes("leave")) {
    leave();
    return;
  }

  const cityName = text;

  console.log("text again");

  //const [_, cityName] = text.split(" ");
  const params = {
    city: cityName,
    key: WEATHERBIT_KEY
  };

  // if (cityName === undefined) {
  //   ctx.reply("Please specify a city name after the /weather command");
  //   return;
  // }
  try {
    const {
      data: { currentWeatherInfo }
    } = await client.query({
      query: getCurrentWeatherInfo,
      variables: { cityName }
    });

    const {
      description,
      icon,
      realTemperature,
      feelsLikeTemperature
    } = currentWeatherInfo;

    const iconPath = `./static/icons/${icon}.png`;
    ctx.replyWithPhoto({ source: iconPath });

    ctx.reply(
      `Temperature: ${realTemperature}\nFeels like temperature: ${feelsLikeTemperature}\n${description}`
    );
    ctx.reply("enter a city name or enter *leave* command");
  } catch (e) {
    console.error("Error occurred when fetching weather info", e);
  }
});

//weatherScene.hears("leave", leave());

weatherScene.leave(ctx => ctx.reply("exiting weatherScene"));

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

      ctx.reply("end");

      console.log(
        "ctx.wizard.state.translationData",
        ctx.wizard.state.translationData
      );

      try {
        const response = await client.query({
          query: getTranslations,
          variables: { ...ctx.wizard.state.translationData }
        });
        const {
          data: {
            translations: { primaryTranslation, translations }
          }
        } = response;
        console.log("primaryTranslation", primaryTranslation);
        console.log("translations", translations);

        const concatenatedTranslationsTexts = translations.reduce(
          (acc, text) => acc + `\n${text}`,
          ""
        );

        ctx.reply(
          `Primary translation: ${primaryTranslation},${concatenatedTranslationsTexts}`
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

//translationScene.enter(ctx => ctx.reply("enter a source language"));
// translationScene.on("text", async ctx => {
//   ctx.webhookReply = false;
//
//   const { text } = ctx.update.message || {};
//
//   console.log("text", text);
//   console.log("ctx.scene.state", ctx.scene.state);
//   if (ctx.scene.state && !ctx.scene.state.sourceLanguage) {
//     ctx.scene.state = {
//       sourceLanguage: text
//     };
//
//     ctx.reply("enter a target language");
//     return;
//   } else if (!ctx.scene.state.targetLanguage) {
//     ctx.scene.state.targetLanguage = text;
//
//     console.log("ctx.scene.state", ctx.scene.state);
//
//     ctx.reply("enter text to translate");
//     return;
//   } else if (!ctx.scene.state.text) {
//     ctx.scene.state.text = text;
//     console.log("after text was assigned");
//     console.log("ctx.scene.state", ctx.scene.state);
//   }
//
//   console.log("ctx.scene.state", ctx.scene.state);
//
//   try {
//     const response = await client.query({
//       query: getTranslations,
//       variables: { ...ctx.scene.state }
//     });
//     console.log("query response", response);
//     ctx.scene.state = {};
//   } catch (e) {
//     console.error("error when fetching translations", e);
//   }
// });

const bot = new Telegraf(process.env.BOT_TOKEN, {
  // Telegram options
  agent: null, // https.Agent instance, allows custom proxy, certificate, keep alive, etc.
  webhookReply: false // Reply via webhook
});
const telegram = new Telegram(process.env.BOT_TOKEN);
const stage = new Stage([translationScene, weatherScene], { ttl: 100 });

bot.use(session());
bot.use(stage.middleware());

const init = async () => {
  try {
    const result = await telegram.setMyCommands([
      {
        command: "hi",
        description: `get a "hi" in response`
      },
      {
        command: "weather",
        description: "get weather in a city"
      },
      {
        command: "gif",
        description: "get random gif by a keyword"
      },
      {
        command: "translate_text",
        description: "translate some text"
      },
      {
        command: "show_keyboard",
        description: "show keyboard with all commands"
      },
      {
        command: "hide_keyboard",
        description: "hide keyboard"
      }
    ]);
    console.log("setMyCommands success");
  } catch (e) {
    console.log("error", e);
  }
};

init();

bot.start(ctx => ctx.reply("Welcome"));

bot.command("show_keyboard", ctx => {
  const keyboard = Markup.keyboard([
    "/hi",
    "/weather",
    "/gif",
    "/hide_keyboard"
  ]);
  console.log("keyboard", keyboard);

  ctx.reply(
    "Keyboard",
    keyboard
      .oneTime()
      .resize()
      .extra()
  );
});

bot.command("hide_keyboard", ctx => {
  console.log("ctx.chat", ctx.chat);
  const { id: chatId } = ctx.chat;

  try {
    telegram.sendMessage(chatId, "Keyboard is gonna be hidden now", {
      reply_markup: JSON.stringify({
        remove_keyboard: true
      })
    });
  } catch (e) {
    console.error("error", e);
  }
});

bot.command("weather", ctx => {
  ctx.scene.enter("weather");
});

bot.help(helpMiddleware);
bot.on("sticker", ctx => ctx.reply("👍"));

bot.command("hi", async ctx => {
  console.log("ctx.update.message.text", ctx.update.message.text);

  const commands = await telegram.getMyCommands();
  console.log("commands", commands);

  ctx.reply(`Hey ${GREETINGS[Math.trunc((Math.random() * 10) % 4)]}`);
});

bot.command("gif", ctx => {
  ctx.webhookReply = false;
  const { text } = ctx.update.message || {};
  const [_, keyWord] = text.split(" ");

  if (keyWord === undefined) {
    ctx.reply("Please specify a keyWord after the /gif command");
    return;
  }

  const params = {
    api_key: GIPHY_API_KEY,
    q: keyWord,
    limit: 10,
    offset: 0,
    rating: "G",
    lang: "en"
  };

  const urlBuilder = new UrlBuilder({ baseUrl: GIPHY_BASE_URL });

  axios
    .get(urlBuilder.getFullUrl(params))
    .then(response => {
      const {
        data: { data: gifs }
      } = response;

      const gif = gifs[Math.trunc(Math.random() * 10)];
      const { images = {} } = gif;

      const { url } = images.downsized_medium || {};
      ctx.replyWithAnimation(url);
    })
    .catch(err => {
      console.log("err", err);
    });
});
bot.hears("d", ctx => ctx.reply("🍆"));
bot.hears("today", ctx => ctx.reply(new Date()));

bot.command("translate_text", async ctx => {
  ctx.scene.enter("translation");
});
// bot.hears(
//   text => text.includes("weather"),
//   ctx => {
//     console.log("ctx.message", ctx.message);
//     const { text } = ctx.message || {};
//
//     const [_, cityName] = text.split(" ");
//     const params = {
//       city: cityName,
//       key: WEATHERBIT_KEY
//     };
//
//     axios
//       .get(getFullUrl(WEATHERBIT_BASE_URL, params))
//       .then(response => {
//         const {
//           data: {
//             data: [weatherInfo]
//           }
//         } = response;
//         const { temp, app_temp } = weatherInfo;
//         console.log("weatherInfo", weatherInfo);
//         ctx.reply("weatherInfo: " + temp);
//       })
//       .catch(err => {
//         console.log("err", err);
//       });
//   }
// );
// bot.launch({
//   webhook: {
//     domain: "https://ilia-kh-telegram-bot.herokuapp.com/",
//     port: process.env.PORT
//   }
// });

bot.startWebhook(
  "/136232b3e2829f06066cb7da2cf72f732899f44353cfbc0467cc7f298d4806ac",
  null,
  process.env.PORT
);
bot.telegram.setWebhook(
  "https://ilia-kh-telegram-bot.herokuapp.com/136232b3e2829f06066cb7da2cf72f732899f44353cfbc0467cc7f298d4806ac"
);

function helpMiddleware(ctx, next) {
  ctx.reply("Send me a sticker");
}
