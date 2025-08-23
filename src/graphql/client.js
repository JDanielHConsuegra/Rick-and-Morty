import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const API_URL = import.meta.env.VITE_API_URL;

const link = new HttpLink({
  uri: API_URL,
  // credentials: "include", // si más adelante necesitas cookies/session
});

export const client = new ApolloClient({
  link,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        // más adelante podemos agregar merge/pagination policies si hace falta
      },
    },
  }),
  defaultOptions: {
    watchQuery: { fetchPolicy: "cache-first", errorPolicy: "all" },
    query: { fetchPolicy: "network-only", errorPolicy: "all" },
  },
});
