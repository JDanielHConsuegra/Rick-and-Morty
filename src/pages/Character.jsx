import { useParams, Link } from "react-router-dom";
import { useQuery } from "@apollo/client/react";
import { GET_CHARACTER_BY_ID } from "../graphql/queries";
import { useFavorites } from "../context/useFavorites.js";
import Comments from "../components/Comments.jsx";

export default function Character() {
  const { id } = useParams();
  const { data, loading, error } = useQuery(GET_CHARACTER_BY_ID, {
    variables: { id },
  });

  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(id);

  if (loading) {
    return (
      <section className="space-y-4">
        <div className="h-6 w-40 rounded bg-slate-200 animate-pulse" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="aspect-square rounded-lg bg-slate-200 animate-pulse" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-4 w-2/3 rounded bg-slate-200 animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-4">
        <p className="text-red-600 text-sm">Error: {error.message}</p>
        <Link to="/" className="text-blue-600 underline">
          ← Back
        </Link>
      </section>
    );
  }

  const c = data?.character;
  if (!c) {
    return (
      <section className="space-y-4">
        <p className="text-slate-600">Character not found.</p>
        <Link to="/" className="text-blue-600 underline">
          ← Back
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold">{c.name}</h2>
        <button
          onClick={() => toggleFavorite(c.id)}
          className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition
            ${
              fav
                ? "border-amber-400 bg-amber-50 text-amber-700"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          aria-pressed={fav}
        >
          <span>{fav ? "★ Favorited" : "☆ Favorite"}</span>
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-xl border bg-white">
          <img
            src={c.image || "https://via.placeholder.com/800x800?text=No+Image"}
            alt={c.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="space-y-3 rounded-xl border bg-white p-4">
          <Row label="Name" value={c.name} />
          <Row label="Status" value={c.status || "Unknown"} />
          <Row label="Species" value={c.species || "Unknown"} />
          <Row label="Gender" value={c.gender || "Unknown"} />
          <Row label="Origin" value={c.origin || "Unknown"} />
          <div className="pt-2">
            <Link to="/" className="text-blue-600 underline text-sm">
              ← Back to list
            </Link>
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="rounded-xl border bg-white p-4">
        <Comments characterId={id} />
      </div>
    </section>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-slate-500 text-sm">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
