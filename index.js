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

const translationScene = require("./scenes/translationScene");
const weatherScene = require("./scenes/weatherScene");
const jsRunningScene = require("./scenes/jsRunningScene");
const yandexMetrikaScene = require("./scenes/yandexMetrikaScene");
const googleSheetsScene = require("./scenes/googleSheetsScene");
const sheets = require("./sheets/index");
const metrikaAuth = require("./yandex_metrika/auth");

const { COMMON_LANGUAGE_STRINGS } = require("./constants/lang");
const { GIPHY_BASE_URL } = require("./constants/apiEndpoints");

let tokenStorage = {
  googleSheetsAccessToken: {},
  metrikaAccessToken: {}
};
let dataStorage = {};
// let tokenStorage = {};

let metrikaAccessToken;
let currentLanguage = "en";

// const OPEN_WEATHER_BASE_URL = "http://api.openweathermap.org/data/2.5/weather"; //?q={city name}&appid={your api key}
// const OPEN_WEATHER_API_KEY = "a5ab5ecaa641726e400f2a4c1fa9a9f";
// const CITY_NAME = "Kaluga";
// const OPEN_WEATHER_URL = `${OPEN_WEATHER_BASE_URL}?q=${"London"}&appid=${OPEN_WEATHER_API_KEY}`;
// const ACCU_WEATHER_URL = `http://dataservice.accuweather.com/currentconditions/v1/${CITY_NAME}`;

const GREETINGS = ["man", "bro", "mate", "comrade"];

const GIPHY_API_KEY = "YVsAQADzVJvmOt52rXTtkJXijApmIa7Y";

const bot = new Telegraf(process.env.BOT_TOKEN, {
  // Telegram options
  agent: null, // https.Agent instance, allows custom proxy, certificate, keep alive, etc.
  webhookReply: false // Reply via webhook
});
const calendar = new Calendar(bot);
const telegram = new Telegram(process.env.BOT_TOKEN);
const stage = new Stage(
  [
    googleSheetsScene,
    jsRunningScene,
    translationScene,
    weatherScene,
    yandexMetrikaScene
  ],
  {
    ttl: 120
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
        command: "select_language",
        description: "select_language"
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

bot.start(ctx =>
  ctx.reply(`Привет, в этом боте можно использовать следующие команды:\n
  /hi - бот ответит приветствием
  /select_language - выбрать русский или английский язык
  /weather - получить информацию о погоде в каком-либо городе в данный момент
  /gif - получить gif'ку по какому-либо ключевому слову
  /translate_text - перевести текст
  /sheets_auth - авторизоваться в Google Sheets API
  /sheets_update - записать данные в гугл таблицу
  /yandex_metrika_auth - авторизоваться в API Яндекс метрик
  /yandex_metrika_start - сформировать и получить отчет по метрикам\n
  
  Можно либо кликнуть на одну из команд выше, либо ввести слэш '/', и тогда отбразится список этих же команд, на любую из которых можно также кликнуть.
`)
);

bot.command("show_keyboard", ctx => {
  const keyboard = Markup.keyboard([
    "/hi",
    "/select_language",
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

bot.command("sheets_update", ctx => {
  const { id: chatId } = ctx.chat;

  console.log("tokenStorage", JSON.stringify(tokenStorage));

  ctx.scene.enter("googleSheets", {
    currentLanguage,
    googleSheetsAccessToken: tokenStorage.googleSheetsAccessToken[chatId]
  });
});

bot.command("yandex_metrika_start", ctx => {
  const { id: chatId } = ctx.chat;

  console.log("tokenStorage", JSON.stringify(tokenStorage));

  ctx.scene.enter("yandexMetrika", {
    currentLanguage,
    dataReportParams: {},
    metrikaAccessToken: tokenStorage.metrikaAccessToken[chatId],
    calendar,
    dataStorage
  });
});

bot.on("sticker", ctx => ctx.reply("👍"));

bot.command("hi", async ctx => {
  const commands = await telegram.getMyCommands();
  console.log("commands", commands);

  ctx.reply(`Hey ${GREETINGS[Math.trunc((Math.random() * 10) % 4)]}`);
});

bot.command("gif", async ctx => {
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

  const giphyFullUrl = `${GIPHY_BASE_URL}?${qs.stringify(params)}`;
  try {
    await axios.get(giphyFullUrl).then(response => {
      const {
        data: { data: gifs }
      } = response;

      const gif = gifs[Math.trunc(Math.random() * 10)];
      const { images = {} } = gif;

      const { url } = images.downsized_medium || {};
      ctx.replyWithAnimation(url);
    });
  } catch (err) {
    console.log("err", err);
  }
});

bot.hears("d", ctx => ctx.reply("🍆"));
bot.hears("today", ctx => ctx.reply(new Date()));

const createAuthCommandHandler = ({
  getAuthUrl,
  authServerName,
  apiName
}) => ctx => {
  console.log("ctx.chat", JSON.stringify(ctx.chat));
  const { id: chatId } = ctx.chat;
  const extraParams = { state: `chatId${chatId}` };

  const { authUrl } = getAuthUrl(extraParams);
  const { authPrompt, authButtonLabel } = COMMON_LANGUAGE_STRINGS[
    currentLanguage
  ];
  return ctx.reply(
    `<b>${authPrompt(authServerName, apiName)}</b>`,
    Extra.HTML().markup(m =>
      m.inlineKeyboard([m.urlButton(authButtonLabel, authUrl)])
    )
  );
};

const createExchangeConfirmationCodeForTokenHandler = ({
  getToken,
  authServerName,
  tokenStorage,
  tokenName
}) => async (req, res) => {
  const { state, code } = req.query;
  const chatId = state ? state.replace(/\D/g, "") : "";
  const { authorizedSuccessfullyMessage } = COMMON_LANGUAGE_STRINGS[
    currentLanguage
  ];

  res.render("confirmationCode", { authServerName });
  tokenStorage[tokenName][chatId] = await getToken(code);

  console.log("tokenStorage", JSON.stringify(tokenStorage));

  if (chatId) {
    telegram.sendMessage(chatId, authorizedSuccessfullyMessage);
  }
};

bot.command(
  "sheets_auth",
  createAuthCommandHandler({
    getAuthUrl: sheets.getAuthUrlAndClient,
    authServerName: "Google",
    apiName: "Google Sheets API"
  })
);

const handleYandexMetrikaAuth = createAuthCommandHandler({
  getAuthUrl: metrikaAuth.getAuthUrl,
  authServerName: "Yandex",
  apiName: "Yandex Metrika API"
});

bot.command("yandex_metrika_auth", handleYandexMetrikaAuth);

// bot.launch({
//   webhook: {
//     domain: "https://ilia-kh-telegram-bot.herokuapp.com/",
//     port: process.env.PORT
//   }
// });

bot.command("select_language", ctx => {
  const { selectLanguagePrompt } = COMMON_LANGUAGE_STRINGS[currentLanguage];
  ctx.reply(
    `<b>${selectLanguagePrompt}</b>`,
    Extra.HTML().markup(m =>
      m.inlineKeyboard([
        m.callbackButton("Русский", "set_lang_ru"),
        m.callbackButton("English", "set_lang_en")
      ])
    )
  );
});

bot.action(/^set_lang_/, async ctx => {
  const { data } = ctx.update.callback_query || {};

  currentLanguage = data.split("_")[2];
  await ctx.answerCbQuery();
  const { languageSelectedMessage } = COMMON_LANGUAGE_STRINGS[currentLanguage];
  ctx.reply(languageSelectedMessage);
});

bot.command("create_callback_button", ctx => {
  ctx.reply(
    `<b>Click this button:</b>`,
    Extra.HTML().markup(m =>
      m.inlineKeyboard([m.callbackButton("My button", "my_button")])
    )
  );
});

bot.action("my_button", ctx => {
  ctx.editMessageText(
    `<b>Click this button(edited):</b>`,
    Extra.HTML().markup(m =>
      m.inlineKeyboard([
        m.callbackButton("My button (edited)", "My button (edited)")
      ])
    )
  );
});

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

app.use(
  express.static(path.join(__dirname, "/static"), {
    extensions: ["css", "html"]
  })
);

app.get(
  "/oauth2callback",
  createExchangeConfirmationCodeForTokenHandler({
    getToken: sheets.getAndSaveToken,
    authServerName: "Google API",
    tokenName: "googleSheetsAccessToken",
    tokenStorage
  })
);

app.get(
  "/yandexOAuth",
  createExchangeConfirmationCodeForTokenHandler({
    getToken: metrikaAuth.getTokenByCode,
    authServerName: "Yandex OAuth",
    tokenName: "metrikaAccessToken",
    tokenStorage
  })
);

const reportData = {
  headers: ["Mетрики", "Даты", "Значения"],
  rows: [
    {
      datesRange: "2020-07-13 - 2020-07-19",
      metricsValues: [16309, 4646],
      name: "2020-07-13 - 2020-07-19",
      __typename: "ReportRowData"
    },
    {
      name: "2020-07-20 - 2020-07-26",
      metricsValues: [16184, 4625],
      datesRange: "2020-07-20 - 2020-07-26",
      __typename: "ReportRowData"
    },
    {
      name: "2020-07-06 - 2020-07-12",
      metricsValues: [14540, 4464],
      datesRange: "2020-07-06 - 2020-07-12",
      __typename: "ReportRowData"
    },
    {
      name: "2020-07-27 - 2020-07-29",
      metricsValues: [10177, 3611],
      datesRange: "2020-07-27 - 2020-07-29",
      __typename: "ReportRowData"
    },
    {
      name: "2020-07-01 - 2020-07-05",
      metricsValues: [6037, 2634],
      datesRange: "2020-07-01 - 2020-07-05",
      __typename: "ReportRowData"
    }
  ]
};

app.get("/reportTable", (req, res) => {
  const { headers, rows } = dataStorage.reportTable;
  res.render("report", { headers, rows });
});

app.listen(process.env.PORT, async () => {
  console.log(`App is listening on port ${process.env.PORT}!`);
  console.log(`Bot token ${process.env.BOT_TOKEN}!`);

  try {
    const response = await axios.get(
      "https://telegraf-bot-graphql-server.herokuapp.com/.well-known/apollo/server-health"
    );
    console.log("hc response", response);
  } catch (e) {
    console.error("Error when health checking graphql server", e);
  }
});

// bot.startWebhook(
//   "/136232b3e2829f06066cb7da2cf72f732899f44353cfbc0467cc7f298d4806ac",
//   null,
//   process.env.PORT
// );

module.exports = {
  handleYandexMetrikaAuth
};
