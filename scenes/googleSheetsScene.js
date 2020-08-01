const WizardScene = require("telegraf/scenes/wizard");
const { oAuth2Client } = require("../sheets/index");
const { google } = require("googleapis");

const { GOOGLE_SHEETS_LANGUAGE_STRINGS } = require("../constants/lang");

const googleSheetsScene = new WizardScene(
  "googleSheets",
  ctx => {
    const { currentLanguage, googleSheetsAccessToken } = ctx.wizard.state;
    if (!googleSheetsAccessToken) {
      const { notAuthorized } = GOOGLE_SHEETS_LANGUAGE_STRINGS[currentLanguage];
      ctx.replyWithHTML(notAuthorized, { parse_mode: "HTML" });
      ctx.scene.leave();
      return;
    }

    const { enterRowNumberPrompt } = GOOGLE_SHEETS_LANGUAGE_STRINGS[
      currentLanguage
    ];

    ctx.replyWithHTML(enterRowNumberPrompt, { parse_mode: "HTML" });
    return ctx.wizard.next();
  },
  ctx => {
    const { currentLanguage } = ctx.wizard.state;
    const { enterCellsValuesPrompt } = GOOGLE_SHEETS_LANGUAGE_STRINGS[
      currentLanguage
    ];
    const { text: rowNumber } = ctx.update.message;

    ctx.wizard.state.inputData = {
      rowNumber
    };

    ctx.replyWithHTML(enterCellsValuesPrompt, { parse_mode: "HTML" });
    return ctx.wizard.next();
  },
  async ctx => {
    const { currentLanguage } = ctx.wizard.state;
    const { dataSuccessfullyWritten } = GOOGLE_SHEETS_LANGUAGE_STRINGS[
      currentLanguage
    ];
    const { text: cellsValues } = ctx.update.message;

    const { rowNumber } = ctx.wizard.state.inputData;

    let cellsData = cellsValues.split(";");
    cellsData = cellsData.length ? cellsData : ["x", "текст", "дата"];

    const sheets = google.sheets({
      version: "v4",
      auth: oAuth2Client
    });

    console.log("updateSpreadsheet");
    console.log("rowNumber", rowNumber);
    console.log("cellsData", cellsData);

    const SPREADSHEET_ID = "1C0aO4j2fVvjO_vXXNg1S_asNnwIOpkO3GaX5gsmpFH0";

    sheets.spreadsheets.values.get(
      {
        spreadsheetId: SPREADSHEET_ID,
        range: "MySheet1!A1:C2"
      },
      (err, res) => {
        console.log("res", res);
        console.log("res.data.values", res.data.values);
      }
    );

    try {
      const { data } = await sheets.spreadsheets.values.update(
        {
          spreadsheetId: SPREADSHEET_ID,
          range: `MySheet1!A${rowNumber}:C${rowNumber}`,
          valueInputOption: "RAW",
          resource: {
            values: [cellsData]
          }
        },
        () => {
          ctx.replyWithHTML(dataSuccessfullyWritten, { parse_mode: "HTML" });
        }
      );

      console.log("data", JSON.stringify(data));
    } catch (e) {
      console.error("Error while updating spreadsheet", e);
    }

    return ctx.scene.leave();
  }
);

module.exports = googleSheetsScene;
