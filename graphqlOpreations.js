const gql = require("graphql-tag");

module.exports = {
  getCurrentWeatherInfo: gql`
    query getCurrentWeatherInfo($cityName: String!) {
      currentWeatherInfo(cityName: $cityName) {
        realTemperature
        feelsLikeTemperature
        code
        icon
        description
      }
    }
  `
};
