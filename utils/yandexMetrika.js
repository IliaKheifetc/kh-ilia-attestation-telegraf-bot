const getTabularData = (data, name) => {
  return data.data
    .map(({ dimensions, metrics }) => ({
      datesRange: `${dimensions[0].from} - ${dimensions[0].to}`,
      metricsValues: metrics
        .map(arr => arr.filter(Boolean))
        .reduce((metrics, metricValue) => [...metrics, ...metricValue], [])
    }))
    .map(item => ({ ...item, name }));
};

// структура должна соответствовать описанию поля data.values в line_chart.spec.json
const getLineChartDataValues = reportRows => {
  // [{ datesRange: "...", metricsValues: [] }]
  return reportRows.reduce(
    (acc, { datesRange, metricsValues }, resultRowIndex) => {
      acc.push(
        ...metricsValues.map((value, metricsValueIndex) => ({
          x: resultRowIndex,
          y: value,
          c: metricsValueIndex
        }))
      );

      return acc;
    },
    []
  );
};

// структура должна соответствовать описанию поля data.values в pie_chart.spec.json
const getPieChartDataValues = reportRows => {
  return reportRows.map(({ name, metricsValues }, index) => ({
    id: name,
    metricValue: metricsValues.reduce((sum, value) => sum + value, 0)
  }));
};

const getSortBy = (fieldName, order = "asc") => collection => {
  const comparatorResult = order === "asc" ? 1 : -1;
  return collection.sort((row1, row2) => {
    const [value1, value2] = [row1, row2].map(r => r[fieldName]);

    return value1 > value2 ? comparatorResult : -comparatorResult;
  });
};

// сортировка по значению поля metricValue по убыванию
const sortByMetricValueDesc = getSortBy("metricValue", "desc");

const createTable = ({ tableRows, headersDict, name }) => {
  const ROW_MAX_LENGTH = 30;
  let caption = `Метрика: <b>${name}</b>`;
  let tableHeader = headersDict.reduce(
    (acc, item) => acc + `|  ${item.rusName}  |`,
    ""
  );

  const keys = headersDict.map(item => item.key).filter(key => key !== "#");
  console.log("keys", keys);
  const tableBody = tableRows.reduce((acc, rowData, rowIndex) => {
    const rowPresentation = keys.reduce((row, key, index) => {
      console.log("rowData[key]", rowData[key]);

      const cellValue = Array.isArray(rowData[key])
        ? rowData[key].join(", ")
        : rowData[key];
      const cell = `| ${cellValue}${index ? " |" : " "}`;
      return row + cell;
    }, "");

    return acc + `| ${rowIndex + 1} ${rowPresentation}\n`;
  }, "");

  return `<pre>${caption}\n${tableHeader}\n${tableBody}</pre>`;
};

const getStartDateFromDatesRange = datesRange =>
  datesRange.split("-").map(str => str.trim());

const sortByDate = rows =>
  rows.sort((row1, row2) => {
    const [dateFrom1, dateFrom2] = [row1, row2]
      .map(r => r.datesRange)
      .map(getStartDateFromDatesRange);
    return dateFrom1 > dateFrom2 ? 1 : -1;
  });

module.exports = {
  getLineChartDataValues,
  getPieChartDataValues,
  getSortBy,
  createTable,
  getTabularData,
  sortByDate,
  sortByMetricValueDesc
};
