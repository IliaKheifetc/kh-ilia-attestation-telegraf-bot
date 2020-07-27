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

module.exports = {
  getTabularData
};
