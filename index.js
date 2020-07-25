const { Telegraf } = require("telegraf");
const session = require("telegraf/session");
const Telegram = require("telegraf/telegram");
const express = require("express");
const Stage = require("telegraf/stage");
const Markup = require("telegraf/markup");
const Extra = require("telegraf/extra");
//const Calendar = require("telegraf-calendar-telegram");
const Calendar = require("./calendar/telegraf-calendar-telegram/index");
const axios = require("axios");
const qs = require("qs");
const path = require("path");

const apolloClient = require("./apolloClient");
const translationScene = require("./scenes/translationScene");
const weatherScene = require("./scenes/weatherScene");
const jsRunningScene = require("./scenes/jsRunningScene");
const yandexMetrikaScene = require("./scenes/yandexMetrikaScene");
const sheets = require("./sheets/index");
const metrikaAuth = require("./yandex_metrika/auth");

let tokenStorage = {};
let metrikaAccessToken;

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
    const queryString = Object.keys(
      params
    ).reduce((queryString, key, index, arr) => {
      if (params[key] === undefined) {
        return queryString;
      }

      queryString += `${key}=${params[key]}`;
      queryString += index < arr.length - 1 ? "&" : "";

      return queryString;
    }, "");

    return `${this.baseUrl}?${queryString}`;
  };
}

const bot = new Telegraf(process.env.BOT_TOKEN, {
  // Telegram options
  agent: null, // https.Agent instance, allows custom proxy, certificate, keep alive, etc.
  webhookReply: false // Reply via webhook
});
const calendar = new Calendar(bot);
const telegram = new Telegram(process.env.BOT_TOKEN);
const stage = new Stage(
  [translationScene, weatherScene, jsRunningScene, yandexMetrikaScene],
  {
    ttl: 100
  }
);

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
        command: "run_javascript",
        description: "run some javascript code"
      },
      {
        command: "sheets_auth",
        description: "authorize for Google Sheets API"
      },
      {
        command: "sheets_update",
        description: "authorize for Google Sheets API"
      },
      {
        command: "yandex_metrika_auth",
        description: "authorize for yandex metrika"
      },
      {
        command: "yandex_metrika_start",
        description: "get count of unique visitors"
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
    "/translate_text",
    "/run_javascript",
    "/hide_keyboard",
    "/sheets_auth",
    "/sheets_update",
    "/yandex_metrika_auth",
    "/yandex_metrika_start"
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

bot.command("translate_text", ctx => {
  ctx.scene.enter("translation");
});

bot.command("run_javascript", ctx => {
  ctx.scene.enter("run_js");
});

bot.command("yandex_metrika_start", ctx => {
  ctx.scene.enter("yandexMetrika", {
    metrikaAccessToken: tokenStorage.metrikaAccessToken,
    calendar
  });
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
      const { data: { data: gifs } } = response;

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

const authCommandHandler = ({ getAuthUrl, authServerName, apiName }) => ctx => {
  console.log("ctx.chat", JSON.stringify(ctx.chat));
  const { id: chatId } = ctx.chat;
  const extraParams = { state: `chatId${chatId}` };

  const { authUrl } = getAuthUrl(extraParams);

  return ctx.reply(
    `<b>Please, authorize with ${authServerName} to have access\n to ${apiName}</b>`,
    Extra.HTML().markup(m =>
      m.inlineKeyboard([m.urlButton(`Authorize`, authUrl)])
    )
  );
};

const getConfirmationCodeHandler = ({
  getToken,
  authServerName,
  tokenStorage,
  tokenName
}) => async (req, res) => {
  const { state, code } = req.query;
  const chatId = state ? state.replace(/\D/g, "") : "";

  // res.send(`<body>Received confirmation code from ${authServerName} successfully!<script>window.open('', '_self', ''); setTimeout(window.close, 2500);</script></body>`)

  // res.sendFile(`confirmationCode.html`, {
  //   root: path.join(__dirname, "static")
  // });

  res.render("confirmationCode", { authServerName });

  tokenStorage[tokenName] = await getToken(code);

  if (chatId) {
    telegram.sendMessage(chatId, "Authorized successfully");
  }
};

bot.command(
  "sheets_auth",
  authCommandHandler({
    getAuthUrl: sheets.getAuthUrlAndClient,
    authServerName: "Google",
    apiName: "Google Sheets API"
  })
);

bot.command(
  "yandex_metrika_auth",
  authCommandHandler({
    getAuthUrl: metrikaAuth.getAuthUrl,
    authServerName: "Yandex",
    apiName: "Yandex Metrika API"
  })
);

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

bot.command("sheets_update", async ctx => {
  const { text } = ctx.update.message || {};

  console.log("text", text);

  sheets.updateSpreadsheet(text);
});

calendar.setDateListener((context, date) => context.reply(date));

bot.command("calendar", ctx => {
  ctx.reply("Here you are", calendar.getCalendar());
});

// bot.command("metrika_get_visitors", async ctx => {
//   const mertikaAPI = new MetrikaAPI(metrikaAccessToken);
//
//   const data = await mertikaAPI.requestVisitors();
//
//   return ctx.reply(
//     `<b>Choose time interval:</b>`,
//     Extra.HTML().markup(m =>
//       m.inlineKeyboard([m.urlButton(`Authorize`, authUrl)])
//     )
//   );
//
//   ctx.reply(`data ${JSON.stringify(data)}`);
// });

bot.telegram.setWebhook(
  "https://ilia-kh-telegram-bot.herokuapp.com/136232b3e2829f06066cb7da2cf72f732899f44353cfbc0467cc7f298d4806ac"
);

const app = express();
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(
  bot.webhookCallback(
    "/136232b3e2829f06066cb7da2cf72f732899f44353cfbc0467cc7f298d4806ac"
  )
);
app.use(express.static(path.join(__dirname, "static")));

app.get(
  "/oauth2callback",
  getConfirmationCodeHandler({
    getToken: sheets.getAndSaveToken,
    authServerName: "Google API",
    tokenName: "googleAccessToken",
    tokenStorage
  })
);

app.get(
  "/yandexOAuth",
  getConfirmationCodeHandler({
    getToken: metrikaAuth.getTokenByCode,
    authServerName: "Yandex OAuth",
    tokenName: "metrikaAccessToken",
    tokenStorage
  })
);

app.listen(process.env.PORT, () => {
  console.log(`App is listening on port ${process.env.PORT}!`);
});

// bot.startWebhook(
//   "/136232b3e2829f06066cb7da2cf72f732899f44353cfbc0467cc7f298d4806ac",
//   null,
//   process.env.PORT
// );

function helpMiddleware(ctx, next) {
  ctx.reply("Send me a sticker");
}
