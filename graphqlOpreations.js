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
      translations(
        sourceLanguage: $sourceLanguage
        targetLanguage: $targetLanguage
        text: $text
      ) {
        primaryTranslation
        translations
      }
    }
  `,
  getReportData: gql`
    query getReportData(
      $dataPresentationForm: String!
      $date1: String!
      $date2: String!
      $ids: [Int]
      $timeIntervalName: String!
      $metrics: [String]
      $dimensions: [String]
      $topKeys: Int
    ) {
      reportData(
        dataPresentationForm: $dataPresentationForm
        date1: $date1
        date2: $date2
        ids: $ids
        timeIntervalName: $timeIntervalName
        metrics: $metrics
        dimensions: $dimensions
        topKeys: $topKeys
      ) {
        reportRows {
          datesRange
          metricsValues
        }
      }
    }
  `
};
