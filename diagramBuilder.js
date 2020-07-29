// START vega-demo.js
const vega = require("vega");
const fs = require("fs");

const { REPORTS_CHART_TYPES } = require("./constants/yandexMetrika");

const createDiagram = async (chartDataValues, reportName) => {
  const chartSpec = REPORTS_CHART_TYPES[reportName];

  return new Promise(resolve => {
    const chartSpecWithReportData = {
      ...chartSpec,
      data: [{ ...chartSpec.data[0], values: chartDataValues }]
    };

    console.log(
      "chartSpecWithReportData",
      JSON.stringify(chartSpecWithReportData)
    );

    // create a new view instance for a given Vega JSON spec
    const view = new vega.View(vega.parse(chartSpecWithReportData))
      .renderer("none")
      .initialize();

    const fileName = "chart.png";

    // generate static PNG file from chart
    view
      .toCanvas()
      .then(function(canvas) {
        // process node-canvas instance for example, generate a PNG stream to write var
        // stream = canvas.createPNGStream();
        console.log("Writing PNG to file...");
        fs.writeFile(fileName, canvas.toBuffer(), err => {
          console.error("error!!!!", err);

          resolve(fileName);
        });
      })
      .catch(function(err) {
        console.log("Error writing PNG to file:");
        console.error(err);
      });
  });
};
// END vega-demo.js

module.exports = {
  createDiagram
};
