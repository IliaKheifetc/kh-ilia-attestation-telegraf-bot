const fetch = require("node-fetch");
const {
  ApolloClient,
  createHttpLink,
  InMemoryCache
} = require("@apollo-client");
const { setContext } = require("@apollo/client/link/context");

const { tokenStorage } = require("./index");

const httpLink = createHttpLink({
  uri:
    process.env.NODE_ENV === "production"
      ? "https://telegraf-bot-graphql-server.herokuapp.com/ "
      : "http://localhost:4055",
  fetch: fetch
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = tokenStorage.metrikaAccessToken;
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ""
    }
  };
});

module.exports = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});
