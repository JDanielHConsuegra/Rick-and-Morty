import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_CHARACTERS, GET_FILTER_OPTIONS } from "../graphql/queries";
import CharacterCard from "../components/CharacterCard";
import ControlsBar from "../components/ControlsBar.jsx";
import { useFavorites } from "../context/useFavorites.js";
import { Loading } from "../components/loading.jsx";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import { FiChevronLeft, FiChevronRight, FiFilter, FiX } from "react-icons/fi";

const PAGE_SIZE = 50;

const itemVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.22, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -12,
    scale: 0.98,
    transition: { duration: 0.18, ease: "easeIn" },
  },
};

function norm(v) {
  return String(v ?? "")
    .trim()
    .toLowerCase();
}

export default function Home() {
  // Controles UI
  const [sortOrder, setSortOrder] = useState("asc");
  const [search, setSearch] = useState("");
  const [onlyFavs, setOnlyFavs] = useState(false);
  const [status, setStatus] = useState("");
  const [species, setSpecies] = useState("");
  const [gender, setGender] = useState("");

  // Página actual (0-based)
  const [page, setPage] = useState(0);

  // Debounce del search (para no recalcular en cada tecla)
  const [debounced, setDebounced] = useState(search);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(search), 250);
    return () => clearTimeout(id);
  }, [search]);

  // Opciones para selects (solo UI)
  const { data: optionsData } = useQuery(GET_FILTER_OPTIONS);
  const filterOptions = optionsData?.filterOptions || {
    statuses: [],
    species: [],
    genders: [],
    origins: [],
  };

  // Favoritos (Set barato por render)
  const { list: favList } = useFavorites();
  const favSet = useMemo(
    () => new Set((favList() || []).map(String)),
    [favList]
  );

  // Traemos SOLO la página actual (sin filtros en el server)
  const { data, loading, error } = useQuery(GET_CHARACTERS, {
    variables: { limit: PAGE_SIZE, offset: page * PAGE_SIZE },
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  // Datos crudos de la página
  const pageItems = useMemo(() => data?.characters ?? [], [data?.characters]);

  // Filtros en CLIENTE, sobre la página visible
  const filteredSorted = useMemo(() => {
    const term = norm(debounced);
    const ns = norm(status);
    const nsp = norm(species);
    const ng = norm(gender);

    let list = pageItems;

    // 1) starts-with por nombre
    if (term) list = list.filter((c) => norm(c?.name).startsWith(term));

    // 2) igualdad por facetas
    if (ns) list = list.filter((c) => norm(c?.status) === ns);
    if (nsp) list = list.filter((c) => norm(c?.species) === nsp);
    if (ng) list = list.filter((c) => norm(c?.gender) === ng);

    // 3) solo favoritos
    if (onlyFavs) list = list.filter((c) => favSet.has(String(c.id)));

    // 4) orden alfabético
    return [...list].sort((a, b) => {
      const cmp = String(a.name).localeCompare(String(b.name), undefined, {
        sensitivity: "base",
      });
      return sortOrder === "asc" ? cmp : -cmp;
    });
  }, [
    pageItems,
    debounced,
    status,
    species,
    gender,
    onlyFavs,
    favSet,
    sortOrder,
  ]);

  // Estado de navegación
  const hasPrev = page > 0;
  const hasNext = pageItems.length === PAGE_SIZE;

  const goPrev = () => {
    if (!hasPrev) return;
    setPage((p) => Math.max(0, p - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goNext = () => {
    if (!hasNext) return;
    setPage((p) => p + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- NUEVO: menú desplegable en mobile para ControlsBar ---
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const activeFiltersCount =
    (search.trim() ? 1 : 0) +
    (onlyFavs ? 1 : 0) +
    (status ? 1 : 0) +
    (species ? 1 : 0) +
    (gender ? 1 : 0);

  // Cierra el panel en mobile al cambiar de página (opcional)
  useEffect(() => {
    setMobileFiltersOpen(false);
  }, [page]);

  return (
    <section className="min-h-screen w-full max-w-screen-xl mx-auto flex flex-col items-stretch gap-6">
      <h2 className="mt-2 text-2xl font-semibold">Characters</h2>

      {/* Botón de filtros en mobile */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setMobileFiltersOpen((v) => !v)}
          aria-expanded={mobileFiltersOpen}
          aria-controls="filters-panel"
          className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition
            ${
              mobileFiltersOpen
                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          title="Show filters"
        >
          {mobileFiltersOpen ? <FiX /> : <FiFilter />}
          Filters
          {activeFiltersCount > 0 && (
            <span className="ml-1 rounded-full bg-emerald-500/90 px-2 py-0.5 text-xs font-semibold text-white">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Panel colapsable (1 sola instancia de ControlsBar) */}
        <AnimatePresence initial={false}>
          {mobileFiltersOpen && (
            <motion.div
              id="filters-panel"
              key="filters-mobile"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="pt-3">
                <ControlsBar
                  search={search}
                  onSearchChange={setSearch}
                  onlyFavs={onlyFavs}
                  onOnlyFavsChange={setOnlyFavs}
                  sortOrder={sortOrder}
                  onSortOrderChange={setSortOrder}
                  status={status}
                  onStatusChange={setStatus}
                  species={species}
                  onSpeciesChange={setSpecies}
                  gender={gender}
                  onGenderChange={setGender}
                  options={filterOptions}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* En desktop (md+), los filtros siempre visibles (misma instancia controlada por CSS) */}
      <div className="hidden md:block">
        <ControlsBar
          search={search}
          onSearchChange={setSearch}
          onlyFavs={onlyFavs}
          onOnlyFavsChange={setOnlyFavs}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          status={status}
          onStatusChange={setStatus}
          species={species}
          onSpeciesChange={setSpecies}
          gender={gender}
          onGenderChange={setGender}
          options={filterOptions}
        />
      </div>

      {/* Info de página y filtros */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          <span className="font-medium">Page:</span> {page + 1}
          {" • "}
          Showing <span className="font-semibold">
            {filteredSorted.length}
          </span>{" "}
          of {pageItems.length} on this page
          {debounced.trim() && (
            <>
              {" "}
              — starting with “
              <span className="font-mono">{debounced.trim()}</span>”
            </>
          )}
          {(status || species || gender) && (
            <>
              {" "}
              — filters [
              {status && (
                <span>
                  Status: <b>{status}</b>
                </span>
              )}
              {status && (species || gender) && " | "}
              {species && (
                <span>
                  Species: <b>{species}</b>
                </span>
              )}
              {species && gender && " | "}
              {gender && (
                <span>
                  Gender: <b>{gender}</b>
                </span>
              )}
              ]
            </>
          )}
          {onlyFavs && " — only favorites"}
          <span className="block text-xs text-slate-400">
            (Filters apply only to the current page)
          </span>
        </p>

        {/* Paginación */}
        <div className="inline-flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            disabled={!hasPrev || loading}
            className={`rounded-full border px-3 py-2 text-sm font-medium transition
              ${
                hasPrev && !loading
                  ? "border-slate-700 border-2 cursor-pointer hover:shadow-2xl bg-white text-slate-700 hover:bg-slate-50"
                  : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
              }`}
            aria-label="Previous page"
            title="Previous page"
          >
            <span className="inline-flex items-center gap-2">
              <FiChevronLeft /> Prev
            </span>
          </button>

          <button
            type="button"
            onClick={goNext}
            disabled={!hasNext || loading}
            className={`rounded-full border px-3 py-2 text-sm font-medium transition
              ${
                hasNext && !loading
                  ? "border-slate-800 font-bold hover:shadow-2xl border-2 bg-white cursor-pointer text-slate-700 hover:bg-slate-50"
                  : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
              }`}
            aria-label="Next page"
            title="Next page"
          >
            <span className="inline-flex items-center gap-2">
              Next <FiChevronRight />
            </span>
          </button>
        </div>
      </div>

      {/* Estado de carga inicial */}
      {loading && pageItems.length === 0 && (
        <div className="py-10">
          <Loading text={"Wait a few seconds..."} />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 w-full">
          Error: {error.message}
        </div>
      )}

      {/* Resultado */}
      {!error && filteredSorted.length > 0 && (
        <motion.div
          layout
          className="flex flex-wrap justify-center gap-5 w-full"
          transition={{ layout: { duration: 0.25 } }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {filteredSorted.map((c) => (
              <motion.div
                key={`${c.id}-${c.name}`}
                layout
                variants={itemVariants}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                <CharacterCard c={c} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Vacío */}
      {!loading && !error && filteredSorted.length === 0 && (
        <div className="rounded-md w-full border bg-white p-6 text-center">
          <p className="text-slate-600">
            No characters match your current filters on this page.
          </p>
        </div>
      )}
    </section>
  );
}
