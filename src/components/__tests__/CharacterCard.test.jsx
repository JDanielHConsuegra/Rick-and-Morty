import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { test, vi, expect } from "vitest";
import CharacterCard from "../CharacterCard.jsx";

// Mock del hook de favoritos para controlar isFavorite en los tests
vi.mock("../../context/useFavorites.js", () => ({
  useFavorites: () => ({
    isFavorite: (id) => String(id) === "123", // solo el id "123" se considera favorito
  }),
}));

function renderCard(c) {
  return render(
    <MemoryRouter>
      <CharacterCard c={c} />
    </MemoryRouter>
  );
}

test("renders name, species and link", () => {
  const c = {
    id: "42",
    name: "Bird Person",
    species: "Bird-Person",
    image: "",
  };
  renderCard(c);

  // Muestra nombre y especie
  expect(screen.getByText("Bird Person")).toBeInTheDocument();
  expect(screen.getByText("Bird-Person")).toBeInTheDocument();

  // Link a la ruta de detalle
  const link = screen.getByRole("link");
  expect(link).toHaveAttribute("href", "/character/42");
});

test("shows favorite badge when isFavorite is true", () => {
  const c = { id: "123", name: "Morty Smith", species: "Human", image: "" };
  renderCard(c);

  // Badge de favorito debe aparecer
  expect(screen.getByText(/favorite/i)).toBeInTheDocument(); // ★ Favorite
});

test("does not show favorite badge when isFavorite is false", () => {
  const c = { id: "999", name: "Random", species: "Alien", image: "" };
  renderCard(c);

  // No aparece badge de favorito
  expect(screen.queryByText(/favorite/i)).not.toBeInTheDocument();
});
