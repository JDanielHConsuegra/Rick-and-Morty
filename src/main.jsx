import React from "react";
import ReactDOM from "react-dom/client";
import { ApolloProvider } from "@apollo/client/react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { client } from "./graphql/client";
import "./index.css";

import App from "./App.jsx";
import Home from "./pages/Home.jsx";
import Character from "./pages/Character.jsx";
import FavoritesProvider from "./context/FavoritesProvider.jsx";
import CommentsProvider from "./context/CommentsProvider.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "character/:id", element: <Character /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <FavoritesProvider>
        <CommentsProvider>
          <RouterProvider router={router} />
        </CommentsProvider>
      </FavoritesProvider>
    </ApolloProvider>
  </React.StrictMode>
);
