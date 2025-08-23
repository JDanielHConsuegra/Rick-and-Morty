import { Link } from "react-router-dom";
import { FiChevronRight, FiUser } from "react-icons/fi";
import { AiFillHeart } from "react-icons/ai";
import { useFavorites } from "../context/useFavorites.js";

export default function CharacterCard({ c }) {
  const { isFavorite } = useFavorites();
  const fav = isFavorite(c.id);

  const img = c.image || "https://via.placeholder.com/400x400?text=No+Image";

  return (
    <Link
      to={`/character/${c.id}`}
      className="group relative block w-40 lg:w-60 overflow-hidden rounded-2xl border bg-white/80 backdrop-blur transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      {/* Favorito */}
      {fav && (
        <div className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700 shadow">
          <AiFillHeart /> Favorite
        </div>
      )}

      {/* Imagen */}
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={img}
          alt={c.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          loading="lazy"
        />
      </div>

      {/* Body */}
      <div className="flex items-start justify-between gap-3 p-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{c.name}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-600">
            <FiUser className="opacity-70" />
            {c.species || "Unknown"}
          </p>
        </div>
        <FiChevronRight className="mt-1 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-600" />
      </div>
    </Link>
  );
}
