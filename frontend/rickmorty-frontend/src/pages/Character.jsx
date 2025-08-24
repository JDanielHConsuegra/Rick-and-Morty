import { useParams, Link } from "react-router-dom";
import { useQuery } from "@apollo/client/react";
import { GET_CHARACTER_BY_ID } from "../graphql/queries";
import { useFavorites } from "../context/useFavorites.js";
import Comments from "../components/Comments.jsx";

// Icons
import {
  FiArrowLeft,
  FiUser,
  FiMapPin,
  FiActivity,
  FiHelpCircle,
} from "react-icons/fi";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { FaSkull } from "react-icons/fa";

function statusClasses(status) {
  const s = String(status || "").toLowerCase();
  if (s === "alive")
    return {
      dot: "bg-emerald-500",
      pill: "text-emerald-700 bg-emerald-50 border-emerald-200",
      icon: <FiActivity />,
    };
  if (s === "dead")
    return {
      dot: "bg-rose-500",
      pill: "text-rose-700 bg-rose-50 border-rose-200",
      icon: <FaSkull />,
    };
  return {
    dot: "bg-slate-400",
    pill: "text-slate-700 bg-slate-50 border-slate-200",
    icon: <FiHelpCircle />,
  };
}

export default function Character() {
  const { id } = useParams();
  const { data, loading, error } = useQuery(GET_CHARACTER_BY_ID, {
    variables: { id },
  });
  const { isFavorite, toggleFavorite } = useFavorites();

  const c = data?.character;
  const fav = isFavorite(id);

  if (loading) {
    return (
      <section className="mx-auto w-full max-w-screen-xl space-y-6">
        <div className="h-6 w-32 rounded bg-slate-200 animate-pulse" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="aspect-square rounded-2xl border bg-white/80 backdrop-blur animate-pulse" />
          <div className="space-y-3 rounded-2xl border bg-white/80 p-4 backdrop-blur">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="h-4 w-2/3 rounded bg-slate-200 animate-pulse"
              />
            ))}
          </div>
        </div>
        <div className="h-40 rounded-2xl border bg-white/80 backdrop-blur animate-pulse" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto w-full max-w-screen-xl space-y-4">
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Error: {error.message}
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-blue-600 underline"
        >
          <FiArrowLeft /> Back
        </Link>
      </section>
    );
  }

  if (!c) {
    return (
      <section className="mx-auto w-full max-w-screen-xl space-y-4">
        <p className="text-slate-700">Character not found.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-blue-600 underline"
        >
          <FiArrowLeft /> Back
        </Link>
      </section>
    );
  }

  const statusUI = statusClasses(c.status);
  const img = c.image || "https://via.placeholder.com/800x800?text=No+Image";

  return (
    <section className="mx-auto w-full max-w-screen-xl space-y-6">
      {/* Breadcrumb / Back */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-blue-600 underline"
        >
          <FiArrowLeft /> Back to list
        </Link>
        <span className="text-xs text-slate-500">ID: {c.id}</span>
      </div>

      {/* Header + Favorite */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-semibold tracking-tight">
          <span className="bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            {c.name}
          </span>
        </h2>

        <button
          onClick={() => toggleFavorite(c.id)}
          className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition
            ${
              fav
                ? "border-amber-300 bg-amber-50 text-amber-700"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          aria-pressed={fav}
          aria-label={fav ? "Remove from favorites" : "Add to favorites"}
          title={fav ? "Favorited" : "Mark as favorite"}
        >
          {fav ? <AiFillHeart /> : <AiOutlineHeart />}{" "}
          {fav ? "Favorited" : "Favorite"}
        </button>
      </div>

      {/* Main content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Image with status pill */}
        <div className="relative overflow-hidden rounded-2xl border bg-white/80 backdrop-blur">
          <img
            src={img}
            alt={c.name}
            className="h-full w-full object-cover md:aspect-square"
            loading="lazy"
          />
          {/* Status pill */}
          <span
            className={`absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${statusUI.pill}`}
            title={`Status: ${c.status || "Unknown"}`}
          >
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${statusUI.dot}`}
            />
            <span className="inline-flex items-center gap-1">
              {statusUI.icon} {c.status || "Unknown"}
            </span>
          </span>
        </div>

        {/* Info panel */}
        <div className="space-y-4 rounded-2xl border bg-blue-100/90 p-4 backdrop-blur">
          <InfoRow icon={<FiUser />} label="Name" value={c.name} />
          <InfoRow
            icon={statusUI.icon}
            label="Status"
            value={c.status || "Unknown"}
            statusDot={statusUI.dot}
          />
          <InfoRow
            icon={<FiUser />}
            label="Species"
            value={c.species || "Unknown"}
          />
          <InfoRow
            icon={<FiUser />}
            label="Gender"
            value={c.gender || "Unknown"}
          />
          <InfoRow
            icon={<FiMapPin />}
            label="Origin"
            value={c.origin || "Unknown"}
          />
        </div>
      </div>

      {/* Comments */}
      <div className="rounded-2xl border bg-blue-100/90 p-4 backdrop-blur">
        <Comments characterId={id} />
      </div>
    </section>
  );
}

function InfoRow({ label, value, icon, statusDot }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="flex items-center gap-2 text-sm text-slate-500">
        {icon}
        {label}
      </span>
      <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-900">
        {statusDot && (
          <span
            className={`inline-block h-2.5 w-2.5 rounded-full ${statusDot}`}
          />
        )}
        {value}
      </span>
    </div>
  );
}
