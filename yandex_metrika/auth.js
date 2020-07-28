const axios = require("axios");
const qs = require("qs");
const fs = require("fs").promises;

const CLIENT_ID = "95beaa102a9344b2821203fc778ca27b";
const REDIRECT_URI = "https://ilia-kh-telegram-bot.herokuapp.com/yandexOAuth";
const APP_PASSWORD = "3607d561cc9d4fbba01ac80f048e838e";
const LOGIN_HINT = "astralonlinewatch@ya.ru";

// const authUrl =
//   "https://oauth.yandex.ru/authorize?response_type=code&client_id=95beaa102a9344b2821203fc778ca27b&redirect_uri=https://ilia-kh-telegram-bot.herokuapp.com/yandexOAuth";

const baseAuthUrl = `https://oauth.yandex.ru/authorize?`;

const getTokenByCode = async code => {
  console.log("code", code);

  try {
    const { data } = await axios.post(
      "https://oauth.yandex.ru/token",
      qs.stringify({
        grant_type: "authorization_code",
        code,
        client_id: CLIENT_ID,
        client_secret: APP_PASSWORD
      }),
      { headers: { "Content-type": "application/x-www-form-urlencoded" } }
    );

    const { access_token, expires_in, refresh_token, token_type } = data;

    await fs.writeFile("token.json", access_token);

    console.log("access_token", access_token);

    return access_token;
  } catch (e) {
    console.error("Error occurred when requesting token", e);
  }
};

//getTokenByCode();

module.exports = {
  getAuthUrl: extraParams => {
    const baseQueryStringParams = qs.stringify({
      response_type: "code",
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      login_hint: LOGIN_HINT
    });
    const extraQueryStringParams = qs.stringify(extraParams);

    return {
      authUrl: `${baseAuthUrl}${baseQueryStringParams}&${extraQueryStringParams}`
    };
  },
  getTokenByCode
};
