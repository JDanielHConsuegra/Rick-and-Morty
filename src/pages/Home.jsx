import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_CHARACTERS, GET_FILTER_OPTIONS } from "../graphql/queries";
import CharacterCard from "../components/CharacterCard";
import ControlsBar from "../components/ControlsBar.jsx";
import { useFavorites } from "../context/useFavorites.js";
import { Loading } from "../components/loading.jsx";
import { AnimatePresence, motion } from "framer-motion";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

const PAGE_SIZE = 25;

function norm(v) {
  return String(v ?? "")
    .trim()
    .toLowerCase();
}

// Variantes de animación para cada card
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

export default function Home() {
  const [sortOrder, setSortOrder] = useState("asc");
  const [search, setSearch] = useState("");
  const [onlyFavs, setOnlyFavs] = useState(false);

  // filtros UI
  const [status, setStatus] = useState("");
  const [species, setSpecies] = useState("");
  const [gender, setGender] = useState("");

  // favoritos
  const { list: favList } = useFavorites();
  const favSet = useMemo(
    () => new Set((favList() || []).map(String)),
    [favList]
  );

  // debounce de búsqueda (prefijo)
  const [debounced, setDebounced] = useState(search);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(search), 250);
    return () => clearTimeout(id);
  }, [search]);

  // opciones de filtros (status/species/gender)
  const { data: optionsData } = useQuery(GET_FILTER_OPTIONS);
  const filterOptions = optionsData?.filterOptions || {
    statuses: [],
    species: [],
    genders: [],
    origins: [],
  };

  // solo enviamos species y gender al backend (status lo filtramos en cliente)
  const apiFilter = useMemo(() => {
    const f = {};
    if (species) f.species = species;
    if (gender) f.gender = gender;
    return f;
  }, [species, gender]);

  // variables base (offset 0 en consulta principal)
  const variables = useMemo(() => {
    const base = { limit: PAGE_SIZE, offset: 0 };
    return Object.keys(apiFilter).length
      ? { ...base, filter: apiFilter }
      : base;
  }, [apiFilter]);

  // paginado
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // visibilidad en cliente (cuántos mostramos)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // reset al cambiar filtros/búsqueda/solo-favs
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [debounced, status, species, gender, onlyFavs]);

  // reset hasMore cuando cambian filtros del server
  useEffect(() => {
    setHasMore(true);
  }, [variables]);

  const { data, loading, error, fetchMore } = useQuery(GET_CHARACTERS, {
    variables,
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  // estabilizar lista base con useMemo (evita warning del linter)
  const baseList = useMemo(() => data?.characters ?? [], [data]);

  // búsqueda por prefijo (cliente)
  const byPrefix = useMemo(() => {
    const term = norm(debounced);
    if (!term) return baseList;
    return baseList.filter((c) => norm(c?.name).startsWith(term));
  }, [baseList, debounced]);

  // igualdad por status/species/gender (respaldo robusto)
  const byFacets = useMemo(() => {
    const wantStatus = !!status;
    const wantSpecies = !!species;
    const wantGender = !!gender;

    if (!wantStatus && !wantSpecies && !wantGender) return byPrefix;

    const ns = norm(status);
    const nsp = norm(species);
    const ng = norm(gender);

    return byPrefix.filter((c) => {
      const okStatus = !wantStatus || norm(c?.status) === ns;
      const okSpecies = !wantSpecies || norm(c?.species) === nsp;
      const okGender = !wantGender || norm(c?.gender) === ng;
      return okStatus && okSpecies && okGender;
    });
  }, [byPrefix, status, species, gender]);

  // solo favoritos
  const afterFavs = useMemo(() => {
    if (!onlyFavs) return byFacets;
    return byFacets.filter((c) => favSet.has(String(c.id)));
  }, [byFacets, onlyFavs, favSet]);

  // orden
  const sorted = useMemo(() => {
    return [...afterFavs].sort((a, b) => {
      const cmp = a.name.localeCompare(b.name, undefined, {
        sensitivity: "base",
      });
      return sortOrder === "asc" ? cmp : -cmp;
    });
  }, [afterFavs, sortOrder]);

  // mostrar solo lo visible
  const displayList = useMemo(() => {
    return sorted.slice(0, Math.min(visibleCount, sorted.length));
  }, [sorted, visibleCount]);

  // cargar más (si hace falta traer del servidor)
  const onViewMore = async () => {
    // si ya tenemos suficientes en cliente, solo incrementa visibilidad
    if (visibleCount + PAGE_SIZE <= baseList.length) {
      setVisibleCount((v) => v + PAGE_SIZE);
      return;
    }

    // si no hay más del servidor, solo intenta mostrar más de lo ya filtrado
    if (!hasMore) {
      setVisibleCount((v) => Math.min(v + PAGE_SIZE, sorted.length));
      return;
    }

    // traer más del servidor y luego incrementar visibilidad
    if (loadingMore) return;
    try {
      setLoadingMore(true);
      const currentCount = baseList.length;
      const res = await fetchMore({
        variables: {
          ...(variables.filter ? { filter: variables.filter } : {}),
          limit: PAGE_SIZE,
          offset: currentCount,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return {
            ...prev,
            characters: [
              ...(prev.characters || []),
              ...(fetchMoreResult.characters || []),
            ],
          };
        },
      });
      const fetched = res?.data?.characters?.length ?? 0;
      if (fetched < PAGE_SIZE) setHasMore(false);
      setVisibleCount((v) => v + (fetched || PAGE_SIZE)); // asegura que mostramos lo recién traído
    } finally {
      setLoadingMore(false);
    }
  };

  const onViewLess = () => {
    setVisibleCount((v) => Math.max(PAGE_SIZE, v - PAGE_SIZE));
  };

  // si el primer lote es menor a PAGE_SIZE, no hay más
  useEffect(() => {
    if (!loading) {
      const noMore = baseList.length < PAGE_SIZE;
      if (noMore) setHasMore(false);
    }
  }, [loading, baseList]);

  // estados de los botones
  const canViewLess = visibleCount > PAGE_SIZE;
  const canViewMore =
    hasMore || // el back dice que hay más
    visibleCount < sorted.length; // o ya hay más cargados que visibles

  return (
    <section className="min-h-screen w-full max-w-screen-xl mx-auto flex flex-col items-stretch gap-6">
      <h2 className="mt-2 text-2xl font-semibold">Characters</h2>

      {/* Controles unificados */}
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

      {/* Estado de carga inicial */}
      {loading && baseList.length === 0 && (
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
      {!error && displayList.length > 0 && (
        <>
          <p className="text-sm text-slate-600">
            Showing <span className="font-semibold">{displayList.length}</span>{" "}
            of {sorted.length} character(s)
            {debounced.trim() && (
              <>
                {" "}
                starting with “
                <span className="font-mono">{debounced.trim()}</span>”
              </>
            )}
            {(status || species || gender) && (
              <>
                {" "}
                with filters [
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
            {onlyFavs && " (only favorites)"}
          </p>

          {/* Grid/cards con animaciones */}
          <motion.div
            layout
            className="flex flex-wrap justify-center gap-5 w-full"
            transition={{ layout: { duration: 0.25 } }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {displayList.map((c) => (
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

          {/* Controles de paginado con personalidad */}
          <div className="mt-6 flex w-full items-center justify-center gap-4">
            <button
              type="button"
              onClick={onViewLess}
              disabled={!canViewLess}
              className={`cursor-pointer select-none rounded-full border px-5 py-2 text-sm font-medium shadow-sm transition
                ${
                  canViewLess
                    ? "border-slate-300 bg-white text-slate-700 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-200"
                    : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                }`}
              title="Show fewer"
              aria-label="Show fewer"
            >
              <span className="inline-flex items-center gap-2">
                <FiChevronUp /> View less
              </span>
            </button>

            <button
              type="button"
              onClick={onViewMore}
              disabled={!canViewMore || loadingMore}
              className={`cursor-pointer select-none rounded-full px-5 py-2 text-sm font-medium transition
                ${
                  !canViewMore || loadingMore
                    ? "cursor-not-allowed bg-slate-200 text-slate-500"
                    : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                }`}
              title="Show more"
              aria-label="Show more"
            >
              <span className="inline-flex items-center gap-2">
                {loadingMore ? (
                  "Loading…"
                ) : (
                  <>
                    <FiChevronDown /> View more
                  </>
                )}
              </span>
            </button>
          </div>
        </>
      )}

      {/* Vacío */}
      {!loading && !error && displayList.length === 0 && (
        <div className="rounded-md w-full border bg-white p-6 text-center">
          <p className="text-slate-600">
            {onlyFavs
              ? "No favorite characters match your current search/filters."
              : "No characters found with current search/filters."}
          </p>
        </div>
      )}
    </section>
  );
}
