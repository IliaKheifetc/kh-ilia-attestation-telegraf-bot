const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");

const credentials = path.join(__dirname, "credentials.json");
const keys = JSON.parse(fs.readFileSync(credentials));
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

// Create an oAuth2 client to authorize the API call
const oAuth2Client = new google.auth.OAuth2(
  keys.web.client_id,
  keys.web.client_secret,
  keys.web.redirect_uris[0]
);

module.exports = {
  getAuthUrlAndClient: extraParams => {
    // Generate the url that will be used for authorization
    const authorizeUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
      state: extraParams.state
    });

    return { authUrl: authorizeUrl, authClient: oAuth2Client };
  },
  getAndSaveToken: async function(code) {
    // Open an http server to accept the oauth callback. In this
    // simple example, the only request to our webserver is to
    // /oauth2callback?code=<code>
    //const app = express();

    return new Promise(resolve => {
      oAuth2Client.getToken(code, (err, tokens) => {
        if (err) {
          console.error("Error getting oAuth tokens:");
          throw err;
        }
        oAuth2Client.credentials = tokens;

        resolve();
      });
    });
  },
  updateSpreadsheet
};

/**
 * Print the names and majors of students in a sample spreadsheet:
 * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 */
function listMajors(auth) {
  const sheets = google.sheets("v4");
  sheets.spreadsheets.values.get(
    {
      auth: auth,
      spreadsheetId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
      range: "Class Data!A2:E"
    },
    (err, res) => {
      if (err) {
        console.error("The API returned an error.");
        throw err;
      }
      const rows = res.data.values;
      if (rows.length === 0) {
        console.log("No data found.");
      } else {
        console.log("Name, Major:");
        for (const row of rows) {
          // Print columns A and E, which correspond to indices 0 and 4.
          console.log(`${row[0]}, ${row[4]}`);
        }
      }
    }
  );
}

async function updateSpreadsheet(data) {
  let [_commandName, rowNumber, ...cellsData] = data.split(" ");
  cellsData = cellsData.length ? cellsData : ["x", "текст", "дата"];

  const sheets = google.sheets({ version: "v4", auth: oAuth2Client });

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
}
