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
  `,
  getTranslations: gql`
    query getTranslations(
      $sourceLanguage: String!
      $targetLanguage: String!
      $text: String!
    ) {
      getTranslations(
        sourceLanguage: $sourceLanguage
        targetLanguage: $targetLanguage
        text: $text
      ) {
        primaryTranslation
        translations
      }
    }
  `
};
