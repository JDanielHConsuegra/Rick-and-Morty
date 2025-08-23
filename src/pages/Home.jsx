import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_CHARACTERS } from "../graphql/queries";
import CharacterCard from "../components/CharacterCard";
import SortBar from "../components/SortBar";
import SearchBar from "../components/SearchBar";
import FavoritesFilter from "../components/FavoritesFilter";
import { useFavorites } from "../context/useFavorites.js";

export default function Home() {
  const [sortOrder, setSortOrder] = useState("asc");
  const [search, setSearch] = useState("");
  const [onlyFavs, setOnlyFavs] = useState(false);

  const { list: favList } = useFavorites();
  const favSet = useMemo(
    () => new Set((favList() || []).map(String)),
    [favList]
  );

  // Debounce del texto de búsqueda (prefijo)
  const [debounced, setDebounced] = useState(search);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(search), 250);
    return () => clearTimeout(id);
  }, [search]);

  // Pedimos “muchos” y filtramos en cliente por "starts with"
  const { data, loading, error } = useQuery(GET_CHARACTERS, {
    variables: { limit: 100, offset: 0 },
  });

  // 1) Filtro por prefijo (case-insensitive)
  const filteredByPrefix = useMemo(() => {
    const list = data?.characters ?? [];
    const term = debounced.trim().toLowerCase();
    if (!term) return list;
    return list.filter((c) => (c?.name || "").toLowerCase().startsWith(term));
  }, [data, debounced]);

  // 2) Filtro “solo favoritos” (si está activo)
  const filtered = useMemo(() => {
    if (!onlyFavs) return filteredByPrefix;
    return filteredByPrefix.filter((c) => favSet.has(String(c.id)));
  }, [filteredByPrefix, onlyFavs, favSet]);

  // 3) Orden A→Z / Z→A
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const cmp = a.name.localeCompare(b.name, undefined, {
        sensitivity: "base",
      });
      return sortOrder === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortOrder]);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold">Characters</h2>

        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <SearchBar value={search} onChange={setSearch} />
          <FavoritesFilter checked={onlyFavs} onChange={setOnlyFavs} />
          <SortBar value={sortOrder} onChange={setSortOrder} />
        </div>
      </div>

      {/* Estado de carga */}
      {loading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border bg-white p-3"
            >
              <div className="aspect-square rounded-md bg-slate-200" />
              <div className="mt-3 h-4 w-2/3 rounded bg-slate-200" />
              <div className="mt-2 h-3 w-1/2 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Error: {error.message}
        </div>
      )}

      {/* Resultado */}
      {!loading && !error && sorted.length > 0 && (
        <>
          <p className="text-sm text-slate-600">
            Showing <span className="font-semibold">{sorted.length}</span>{" "}
            character(s)
            {debounced.trim() && (
              <>
                {" "}
                starting with “
                <span className="font-mono">{debounced.trim()}</span>”
              </>
            )}
            {onlyFavs && " (only favorites)"}
          </p>

          <div
            className="
              grid gap-4
              grid-cols-2
              sm:grid-cols-3
              lg:grid-cols-4
              xl:grid-cols-5
            "
          >
            {sorted.map((c) => (
              <CharacterCard key={c.id} c={c} />
            ))}
          </div>
        </>
      )}

      {/* Vacío */}
      {!loading && !error && sorted.length === 0 && (
        <div className="rounded-md border bg-white p-6 text-center">
          <p className="text-slate-600">
            {onlyFavs
              ? "No favorite characters match your current search."
              : "No characters found."}
          </p>
        </div>
      )}
    </section>
  );
}
