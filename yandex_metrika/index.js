const axios = require("axios");

const CLIENT_ID = "95beaa102a9344b2821203fc778ca27b";
const REDIRECT_URI = "https://ilia-kh-telegram-bot.herokuapp.com/yandexOAuth";
const APP_PASSWORD = "3607d561cc9d4fbba01ac80f048e838e";

// const authUrl =
//   "https://oauth.yandex.ru/authorize?response_type=code&client_id=95beaa102a9344b2821203fc778ca27b&redirect_uri=https://ilia-kh-telegram-bot.herokuapp.com/yandexOAuth";

const authUrl = `https://oauth.yandex.ru/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}`;

const getTokenByCode = async code => {
  console.log("code", code);

  try {
    const response = await axios.post(
      "http://oauth.yandex.ru/token",
      {
        grant_type: "authorization_code",
        code,
        client_id: CLIENT_ID,
        client_secret: APP_PASSWORD
      },
      { headers: { "Content-type": "application/x-www-form-urlencoded" } }
    );

    console.log("response", response);
  } catch (e) {
    console.error("Error occurred when requesting token", e);
  }
};

// getTokenByCode();

module.exports = {
  getAuthUrl: () => authUrl,
  getTokenByCode
};
