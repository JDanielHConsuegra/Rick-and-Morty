import { Link } from "react-router-dom";
import { useFavorites } from "../context/useFavorites.js";

export default function CharacterCard({ c }) {
  const { isFavorite } = useFavorites();
  const fav = isFavorite(c.id);
  const img = c.image || "https://via.placeholder.com/300x300?text=No+Image";

  return (
    <Link
      to={`/character/${c.id}`}
      className="group block rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
        <img
          src={img}
          alt={c.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {fav && (
          <span
            className="absolute right-2 top-2 rounded-full border border-amber-300 bg-amber-100/90 px-2 py-0.5 text-xs font-semibold text-amber-700 shadow-sm"
            aria-label="Favorited"
            title="Favorited"
          >
            ★ Favorite
          </span>
        )}
      </div>

      <div className="p-3">
        <h3 className="text-base font-semibold leading-tight line-clamp-1">
          {c.name}
        </h3>
        <p className="text-sm text-slate-600">{c.species || "Unknown"}</p>
      </div>
    </Link>
  );
}
