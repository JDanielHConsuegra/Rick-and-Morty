import {
  FiSearch,
  FiFilter,
  FiSliders,
  FiUser,
  FiActivity,
  FiGlobe,
} from "react-icons/fi";
import { BiSortAZ, BiSortZA } from "react-icons/bi";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

/**
 * Props:
 * - search, onSearchChange
 * - onlyFavs, onOnlyFavsChange
 * - sortOrder, onSortOrderChange ("asc" | "desc")
 * - status, onStatusChange
 * - species, onSpeciesChange
 * - gender, onGenderChange
 * - options: { statuses: string[], species: string[], genders: string[] }
 */
export default function ControlsBar({
  search,
  onSearchChange,
  onlyFavs,
  onOnlyFavsChange,
  sortOrder,
  onSortOrderChange,
  status,
  onStatusChange,
  species,
  onSpeciesChange,
  gender,
  onGenderChange,
  options = { statuses: [], species: [], genders: [] },
}) {
  return (
    <div className="w-full rounded-2xl border bg-white/80 p-4 backdrop-blur">
      {/* Grid principal: izquierda (search + favorites), derecha (sort + filtros) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        {/* IZQUIERDA: Search + Favorites (stacked y alineados) */}
        <div className="md:col-span-5">
          <div className="flex flex-col gap-3">
            {/* Search */}
            <div>
              <label
                htmlFor="search"
                className="mb-1 flex items-center gap-2 text-xs font-medium text-slate-600"
              >
                <FiSearch className="opacity-80" />
                Search characters by name
              </label>
              <div className="relative">
                <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                <input
                  id="search"
                  type="text"
                  value={search}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  placeholder="e.g., Rick"
                  className="w-full rounded-xl border bg-white/90 pl-9 pr-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  aria-label="Search characters by name"
                />
              </div>
            </div>

            {/* Show only favorites (nuevo diseño, debajo del search) */}
            <div className="w-full">
              {/* Checkbox accesible (asociado al label) */}
              <input
                id="onlyFavs"
                type="checkbox"
                checked={onlyFavs}
                onChange={(e) => onOnlyFavsChange?.(e.target.checked)}
                className="peer sr-only"
                aria-label="Show only favorites"
              />
              {/* Label estilizado como pill + switch */}
              <label
                htmlFor="onlyFavs"
                className={`
                  inline-flex w-full items-center justify-between gap-3 rounded-2xl border px-3 py-2 text-xs font-medium shadow-sm transition
                  ${
                    onlyFavs
                      ? "border-amber-300 bg-gradient-to-r from-amber-50 to-rose-50 text-amber-700"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }
                `}
              >
                <span className="inline-flex items-center gap-2">
                  <span
                    className={`inline-flex items-center justify-center rounded-full p-1 text-base transition ${
                      onlyFavs ? "text-amber-600" : "text-slate-500"
                    }`}
                    aria-hidden="true"
                  >
                    {onlyFavs ? <AiFillHeart /> : <AiOutlineHeart />}
                  </span>
                  {/* Texto que usan tus tests */}
                  <span className="whitespace-nowrap">Show only favorites</span>
                </span>

                {/* Toggle visual */}
                <span
                  className={`
                    relative inline-grid h-5 w-9 place-items-center rounded-full border transition
                    ${
                      onlyFavs
                        ? "border-amber-300 bg-amber-100"
                        : "border-slate-300 bg-slate-100"
                    }
                  `}
                  aria-hidden="true"
                >
                  <span
                    className={`
                      absolute left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200
                      ${onlyFavs ? "translate-x-4" : "translate-x-0"}
                    `}
                  />
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* DERECHA: Sort + Filtros */}
        <div className="md:col-span-7">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            {/* Sort */}
            <div className="sm:col-span-1">
              <label
                htmlFor="sort"
                className="mb-1 flex items-center gap-2 text-xs font-medium text-slate-600"
              >
                <FiSliders className="opacity-80" />
                Sort by name
              </label>
              <div className="relative">
                <select
                  id="sort"
                  value={sortOrder}
                  onChange={(e) => onSortOrderChange?.(e.target.value)}
                  className="w-full appearance-none rounded-xl border bg-white/90 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  aria-label="Sort by name"
                >
                  <option value="asc">A–Z</option>
                  <option value="desc">Z–A</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                  {sortOrder === "asc" ? <BiSortAZ /> : <BiSortZA />}
                </span>
              </div>
            </div>

            {/* Status */}
            <div className="sm:col-span-1">
              <label
                htmlFor="status"
                className="mb-1 flex items-center gap-2 text-xs font-medium text-slate-600"
              >
                <FiActivity className="opacity-80" />
                Filter by status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => onStatusChange?.(e.target.value)}
                className="w-full rounded-xl border bg-white/90 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                aria-label="Filter by status"
              >
                <option value="">All</option>
                {options.statuses?.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Species */}
            <div className="sm:col-span-1">
              <label
                htmlFor="species"
                className="mb-1 flex items-center gap-2 text-xs font-medium text-slate-600"
              >
                <FiUser className="opacity-80" />
                Filter by species
              </label>
              <select
                id="species"
                value={species}
                onChange={(e) => onSpeciesChange?.(e.target.value)}
                className="w-full rounded-xl border bg-white/90 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                aria-label="Filter by species"
              >
                <option value="">All</option>
                {options.species?.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Gender */}
            <div className="sm:col-span-1">
              <label
                htmlFor="gender"
                className="mb-1 flex items-center gap-2 text-xs font-medium text-slate-600"
              >
                <FiGlobe className="opacity-80" />
                Filter by gender
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => onGenderChange?.(e.target.value)}
                className="w-full rounded-xl border bg-white/90 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                aria-label="Filter by gender"
              >
                <option value="">All</option>
                {options.genders?.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Línea visual sutil */}
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <FiFilter /> Filters apply with AND logic.
          </div>
        </div>
      </div>
    </div>
  );
}
