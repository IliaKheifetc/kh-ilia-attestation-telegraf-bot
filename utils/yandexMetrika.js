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

const sortByDate = data => {
  return data.sort((row1, row2) => (row1.from > row.from ? 1 : -1));
};

module.exports = {
  createLineChartData,
  getTabularData,
  sortByDate
};
