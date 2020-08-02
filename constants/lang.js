const COMMON_LANGUAGE_STRINGS = {
  en: {
    authPrompt: (authServerName, apiName) =>
      `Please, log in with ${authServerName} to have access\n to ${apiName}`,
    authButtonLabel: "Authorize",
    authorizedSuccessfullyMessage: "You authorized successfully",
    languageSelectedMessage: "Language selected",
    selectLanguagePrompt: "Choose language:"
  },
  ru: {
    authPrompt: (authServerName, apiName) =>
      `Пожалуйста, авторизуйтесь в ${authServerName}, чтобы иметь доступ к ${apiName}`,
    authButtonLabel: "Авторизоваться",
    authorizedSuccessfullyMessage: "Вы успешно авторизовались",
    languageSelectedMessage: "Язык выбран",
    selectLanguagePrompt: "Выберите язык:"
  }
};

const YANDEX_LANGUAGE_STRINGS = {
  en: {
    selectReportPrompt: "Choose report:",
    selectTimeIntervalPrompt: "Choose time interval:",
    yandexMetrikaNotAuthorized:
      "Please log in using <b>/yandex_metrika_auth</b> command",
    reportSelectorButtonsLabels: {
      visitors: "Visits and visitors",
      newVisitors: "New visitors",
      browsers: "Browsers"
    },
    reportTypeError: "You entered unsupported/wrong report name",
    timeIntervalSelectorButtonsLabels: {
      day: "day",
      week: "week",
      month: "month",
      quarter: "quarter",
      year: "year"
    },
    timeIntervalTypeError: "You entered unsupported/wrong time interval",
    startDateSelectorPrompt: "Select start date",
    endDateSelectorPrompt: "Select end date",
    viewPrompt: "<b>Click to view report!</b>",
    viewReportButton: "View"
  },
  ru: {
    selectReportPrompt: "Выберите отчет:",
    selectTimeIntervalPrompt: "Выберите интервал для разбиения:",
    yandexMetrikaNotAuthorized:
      "Пожалуйста, авторизуйтесь, используя команду <b>/yandex_metrika_auth</b>",
    reportSelectorButtonsLabels: {
      visitors: "Визиты и посетители",
      newVisitors: "Новые посетители",
      browsers: "Браузеры"
    },
    reportTypeError: "Вы ввели неподдерживаемый/некорректный тип отчета",
    timeIntervalSelectorButtonsLabels: {
      day: "День",
      week: "Неделя",
      month: "Месяц",
      quarter: "Квартал",
      year: "Год"
    },
    timeIntervalTypeError: "Вы ввели неподдерживаемый/некорректный тип временного интервала",
    startDateSelectorPrompt: "Выберите начальную дату",
    endDateSelectorPrompt: "Выберите конечную дату",
    viewPrompt: "<b>Нажмите, чтобы просмотреть отчет!</b>",
    viewReportButton: "Просмотреть"
  }
};

const GOOGLE_SHEETS_LANGUAGE_STRINGS = {
  en: {
    dataSuccessfullyWritten:
      "Your data has been successfully written, you can view the sheet using that link: <b>https://docs.google.com/spreadsheets/d/1C0aO4j2fVvjO_vXXNg1S_asNnwIOpkO3GaX5gsmpFH0/edit?usp=sharing</b>",
    enterRowNumberPrompt: "<b>Enter # of the row where to write your data</b>",
    enterCellsValuesPrompt:
      "<b>Enter data for cells, separating each cell value by a ';'</b>",
    notAuthorized: "Please log in using <b>/sheets_auth</b> command",
    rowNumberTypeError: "Row number must be a number"
  },
  ru: {
    dataSuccessfullyWritten:
      "Ваши данные были успешно записаны, посмотреть таблицу можно по ссылке:<b>https://docs.google.com/spreadsheets/d/1C0aO4j2fVvjO_vXXNg1S_asNnwIOpkO3GaX5gsmpFH0/edit?usp=sharing</b>",
    enterRowNumberPrompt:
      "<b>Введите номер строки, куда нужно записать ваши данные</b>",
    enterCellsValuesPrompt:
      "<b>Введите данные ячеек строки, используя ';' как разделитель</b>",
    notAuthorized:
      "Пожалуйста, авторизуйтесь, используя команду <b>/sheets_auth</b>",
    rowNumberTypeError: "Номер строки должен быть числом"
  }
};

module.exports = {
  COMMON_LANGUAGE_STRINGS,
  GOOGLE_SHEETS_LANGUAGE_STRINGS,
  YANDEX_LANGUAGE_STRINGS
};
