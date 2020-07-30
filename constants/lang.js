const LANGUAGE_STRINGS = {
  en: {
    selectLanguagePrompt: "Choose language:",
    authPrompt: (authServerName, apiName) =>
      `Please, authorize with ${authServerName} to have access\n to ${apiName}`
  },
  ru: {
    selectLanguagePrompt: "Выберите язык:",
    authPrompt: (authServerName, apiName) =>
      `Пожалуйста, авторизуйтесь в ${authServerName}, чтобы иметь доступ к ${apiName}`
  }
};

module.exports = {
  LANGUAGE_STRINGS
};
