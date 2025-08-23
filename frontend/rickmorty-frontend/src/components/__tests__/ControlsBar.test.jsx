import { render, screen } from "@testing-library/react";
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
  const input = screen.getByLabelText(/search characters by name/i);
  await u.type(input, "Ric");
  expect(onSearchChange).toHaveBeenCalled();

  // Toggle de favoritos → debe llamar a onOnlyFavsChange(true)
  const favs = screen.getByLabelText(/show only favorites/i);
  await u.click(favs);
  expect(onOnlyFavsChange).toHaveBeenCalledWith(true);

  // Cambiar orden descendente → onSortOrderChange("desc")
  const sort = screen.getByLabelText(/sort by name/i);
  await u.selectOptions(sort, "desc");
  expect(onSortOrderChange).toHaveBeenCalledWith("desc");

  // Seleccionar opciones de filtros → onStatus/Species/GenderChange
  await u.selectOptions(screen.getByLabelText(/filter by status/i), "Alive");
  expect(onStatusChange).toHaveBeenCalledWith("Alive");

  await u.selectOptions(screen.getByLabelText(/filter by species/i), "Human");
  expect(onSpeciesChange).toHaveBeenCalledWith("Human");

  await u.selectOptions(screen.getByLabelText(/filter by gender/i), "Male");
  expect(onGenderChange).toHaveBeenCalledWith("Male");
});
