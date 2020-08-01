const WizardScene = require("telegraf/scenes/wizard");
const { oAuth2Client } = require("../sheets/index");
const { google } = require("googleapis");

const googleSheetsScene = new WizardScene(
  "googleSheets",
  ctx => {
    ctx.reply("<b>Enter # of the row where to write your data</b>");

    return ctx.wizard.next();
  },
  ctx => {
    const { text: rowNumber } = ctx.update.message;

    ctx.wizard.state.inputData = {
      rowNumber
    };

    ctx.reply(
      "<b>Enter data for cells, separating each cell value by a ';'</b>"
    );

    return ctx.scene.next();
  },
  async ctx => {
    console.log("last step");
    const { text: cellsValues } = ctx.update.message;

    const { rowNumber } = ctx.wizard.state.inputData;
    console.log("rowNumber", rowNumber);

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
      const { data } = await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `MySheet1!A${rowNumber}:C${rowNumber}`,
        valueInputOption: "RAW",
        resource: {
          values: [cellsData]
        }
      });

      console.log("data", JSON.stringify(data));
    } catch (e) {
      console.error("Error while updating spreadsheet", e);
    }

    return ctx.scene.leave();
  }
);

module.exports = googleSheetsScene;
