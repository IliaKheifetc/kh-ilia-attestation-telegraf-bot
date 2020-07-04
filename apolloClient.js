const fetch = require("node-fetch");

const { ApolloClient } = require("apollo-client");
const { HttpLink } = require("apollo-link-http");
const { InMemoryCache } = require("apollo-cache-inmemory");

module.exports = new ApolloClient({
  link: new HttpLink({
    uri:
      process.env.NODE_ENV === "production"
        ? "https://telegraf-bot-graphql-server.herokuapp.com/ "
        : "http://localhost:4055",
    fetch: fetch
  }),
  cache: new InMemoryCache()
});
