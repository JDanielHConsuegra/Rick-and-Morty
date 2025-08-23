import { useEffect, useMemo, useState } from "react";
import { FavoritesContext, STORAGE_KEY } from "./FavoritesContext.js";

export default function FavoritesProvider({ children }) {
  const [ids, setIds] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      if (import.meta.env.DEV) {
        console.warn("Favorites: failed to read storage", e);
      }
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch (e) {
      if (import.meta.env.DEV) {
        console.warn("Favorites: failed to write storage", e);
      }
    }
  }, [ids]);

  const value = useMemo(
    () => ({
      isFavorite: (id) => ids.includes(String(id)),
      toggleFavorite: (id) =>
        setIds((curr) => {
          const key = String(id);
          return curr.includes(key)
            ? curr.filter((x) => x !== key)
            : [...curr, key];
        }),
      list: () => ids,
      clear: () => setIds([]),
    }),
    [ids]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}
