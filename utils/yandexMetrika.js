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

const createLineChartData = tabularData => {
  // [{ datesRange: "...", metricsValues: [] }]
  return {
    name: "table",
    values: tabularData.reduce(
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
    )
  };
};

const createTable = (table, name) => {
  const ROW_MAX_LENGTH = 30;
  let caption = `Метрика: <b>${name}</b>`;
  let tableHeader = table.headers.reduce(
    (acc, item) => acc + `|  ${item}  |`,
    ""
  );

  const tableBody = table.data.reduce(
    (acc, { datesRange, metricsValues }, index) => {
      return (
        acc + `| ${index} | ${datesRange}  |  ${metricsValues.join(", ")} |\n`
      );
    },
    ""
  );

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
  createLineChartData,
  createTable,
  getTabularData,
  sortByDate
};
