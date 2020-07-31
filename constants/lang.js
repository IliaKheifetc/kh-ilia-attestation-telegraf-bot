const LANGUAGE_STRINGS = {
  en: {
    selectLanguagePrompt: "Choose language:",
    selectReportPrompt: "Choose report:",
    selectTimeIntervalPrompt: "Choose time interval:",
    authPrompt: (authServerName, apiName) =>
      `Please, authorize with ${authServerName} to have access\n to ${apiName}`,
    authButtonLabel: "Authorize",
    authorizedSuccessfullyMessage: "You authorized successfully",
    languageSelectedMessage: "Language selected",
    yandexMetrikaNotAuthorized:
      "Please authorize using <b>/yandex_metrika_auth</b> command",
    reportSelectorButtonsLabels: {
      visitors: "Visits and visitors",
      newVisitors: "New visitors",
      browsers: "Browsers"
    },
    timeIntervalSelectorButtonsLabels: {
      day: "day",
      week: "week",
      month: "month",
      quarter: "quarter",
      year: "year"
    },
    startDateSelectorPrompt: "Select start date",
    endDateSelectorPrompt: "Select end date",
    viewReportButton: "View"
  },
  ru: {
    selectLanguagePrompt: "Выберите язык:",
    selectReportPrompt: "Выберите отчет:",
    selectTimeIntervalPrompt: "Выберите интервал для разбиения:",
    authPrompt: (authServerName, apiName) =>
      `Пожалуйста, авторизуйтесь в ${authServerName}, чтобы иметь доступ к ${apiName}`,
    authButtonLabel: "Авторизоваться",
    authorizedSuccessfullyMessage: "Вы успешно авторизовались",
    languageSelectedMessage: "Язык выбран",
    yandexMetrikaNotAuthorized:
      "Пожалуйста, авторизуйтесь, используя команду <b>/yandex_metrika_auth</b>",
    reportSelectorButtonsLabels: {
      visitors: "Визиты и посетители",
      newVisitors: "Новые посетители",
      browsers: "Браузеры"
    },
    timeIntervalSelectorButtonsLabels: {
      day: "День",
      week: "Неделя",
      month: "Месяц",
      quarter: "Квартал",
      year: "Год"
    },
    startDateSelectorPrompt: "Выберите начальную дату",
    endDateSelectorPrompt: "Выберите конечную дату",
    viewReportButton: "Просмотреть"
  }
};

module.exports = {
  LANGUAGE_STRINGS
};
