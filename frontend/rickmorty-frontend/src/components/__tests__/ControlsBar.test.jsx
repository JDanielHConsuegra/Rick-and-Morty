import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { test, vi, expect } from "vitest";
import ControlsBar from "../ControlsBar.jsx";

function setup() {
  const onSearchChange = vi.fn();
  const onOnlyFavsChange = vi.fn();
  const onSortOrderChange = vi.fn();
  const onStatusChange = vi.fn();
  const onSpeciesChange = vi.fn();
  const onGenderChange = vi.fn();

  const options = {
    statuses: ["Alive", "Dead", "unknown"],
    species: ["Human", "Alien"],
    genders: ["Male", "Female", "unknown"],
  };

  render(
    <ControlsBar
      search=""
      onSearchChange={onSearchChange}
      onlyFavs={false}
      onOnlyFavsChange={onOnlyFavsChange}
      sortOrder="asc"
      onSortOrderChange={onSortOrderChange}
      status=""
      onStatusChange={onStatusChange}
      species=""
      onSpeciesChange={onSpeciesChange}
      gender=""
      onGenderChange={onGenderChange}
      options={options}
    />
  );

  return {
    onSearchChange,
    onOnlyFavsChange,
    onSortOrderChange,
    onStatusChange,
    onSpeciesChange,
    onGenderChange,
  };
}

// Pequeño helper para abrir un InlineSelect por su título
function getSelectToggle(titleText) {
  const labelEl = screen.getByText(new RegExp(`^${titleText}$`, "i"));
  const header = labelEl.closest("div"); // cabecera del control (título + botón)
  expect(header).not.toBeNull();
  return within(header).getByRole("button");
}

test("updates search, toggles favorites, changes sort and facets", async () => {
  const u = userEvent.setup();
  const {
    onSearchChange,
    onOnlyFavsChange,
    onSortOrderChange,
    onStatusChange,
    onSpeciesChange,
    onGenderChange,
  } = setup();

  // Escribir en el buscador → debe llamar a onSearchChange
  // (el input usa placeholder, no label)
  const input = screen.getByPlaceholderText(/search characters by name/i);
  await u.type(input, "Ric");
  expect(onSearchChange).toHaveBeenCalled();

  // Toggle de favoritos → debe llamar a onOnlyFavsChange(true)
  // (es un botón con el texto "Only favorites")
  const favs = screen.getByRole("button", { name: /only favorites/i });
  await u.click(favs);
  expect(onOnlyFavsChange).toHaveBeenCalledWith(true);

  // Cambiar orden descendente → onSortOrderChange("desc")
  // (InlineSelect basado en botones, no <select>)
  const sortToggle = getSelectToggle("Sort by name");
  await u.click(sortToggle);
  const descOption = await screen.findByRole("button", {
    name: /^\s*Z\s*→\s*A\s*$/i,
  });
  await u.click(descOption);
  expect(onSortOrderChange).toHaveBeenCalledWith("desc");

  // Seleccionar opciones de filtros → onStatus/Species/GenderChange
  const statusToggle = getSelectToggle("Status");
  await u.click(statusToggle);
  const alive = await screen.findByRole("button", { name: /^Alive$/i });
  await u.click(alive);
  expect(onStatusChange).toHaveBeenCalledWith("Alive");

  const speciesToggle = getSelectToggle("Species");
  await u.click(speciesToggle);
  const human = await screen.findByRole("button", { name: /^Human$/i });
  await u.click(human);
  expect(onSpeciesChange).toHaveBeenCalledWith("Human");

  const genderToggle = getSelectToggle("Gender");
  await u.click(genderToggle);
  const male = await screen.findByRole("button", { name: /^Male$/i });
  await u.click(male);
  expect(onGenderChange).toHaveBeenCalledWith("Male");
});
