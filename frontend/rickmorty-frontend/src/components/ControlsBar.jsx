import { useEffect, useMemo, useRef, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import {
  FiChevronDown,
  FiChevronUp,
  FiCheck,
  FiSearch,
  FiStar,
  FiX,
} from "react-icons/fi";

/**
 * Toggle "Only favorites" (switch compacto)
 */
function FavSwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`
        inline-flex items-center gap-2 rounded-lg border px-3 py-2
        text-xs sm:text-sm transition
        ${
          checked
            ? "border-amber-300 bg-amber-50 text-amber-700"
            : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
        }
      `}
      aria-pressed={checked}
      title="Show only favorites"
    >
      <FiStar className={checked ? "fill-amber-500 text-amber-500" : ""} />
      <span>Only favorites</span>
    </button>
  );
}

/**
 * InlineSelect con animación suave (altura auto + opacidad)
 * - Renderiza opciones en el flujo normal del documento (sin overlay), con transición.
 * - value: string (o "")
 * - onChange: (v) => void
 * - options: [{ label, value }]
 * - title: etiqueta del control
 * - allowClear: si true, muestra botón para limpiar selección
 */
function InlineSelect({ value, onChange, options, title, allowClear = true }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const current = useMemo(
    () => options.find((o) => o.value === value) || null,
    [options, value]
  );

  // Cerrar al hacer click fuera
  useEffect(() => {
    function onDocClick(e) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const clear = () => onChange("");

  return (
    <div ref={wrapRef} className="w-full">
      {/* Encabezado del control */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-600 sm:text-sm">
          {title}
        </span>
        <div className="flex items-center gap-1">
          {allowClear && value !== "" && (
            <button
              type="button"
              onClick={clear}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] sm:text-xs text-slate-600 hover:bg-slate-100"
              title="Clear"
              aria-label={`Clear ${title}`}
            >
              <FiX /> Clear
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50"
            title={open ? "Collapse" : "Expand"}
          >
            <span className="truncate max-w-[9rem] sm:max-w-[12rem]">
              {current?.label || "Any"}
            </span>
            {open ? <FiChevronUp /> : <FiChevronDown />}
          </button>
        </div>
      </div>

      {/* Opciones en flujo normal con transición suave */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="inline-options"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="mt-2 rounded-lg border border-slate-200 bg-white p-2">
              <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4">
                {options.map((opt) => {
                  const selected = opt.value === value;
                  return (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => {
                        onChange(opt.value);
                        setOpen(false);
                      }}
                      className={`
                        group flex items-center justify-between gap-2 rounded-md border px-2 py-1.5
                        text-[11px] sm:text-xs transition
                        ${
                          selected
                            ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }
                      `}
                      title={opt.label}
                    >
                      <span className="truncate">{opt.label}</span>
                      {selected && <FiCheck className="shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ControlsBar({
  // búsqueda + orden
  search,
  onSearchChange,
  sortOrder,
  onSortOrderChange,
  // favoritos
  onlyFavs,
  onOnlyFavsChange,
  // filtros
  status,
  onStatusChange,
  species,
  onSpeciesChange,
  gender,
  onGenderChange,
  // opciones únicas del backend (para poblar Selects)
  options = { statuses: [], species: [], genders: [] },
}) {
  // Normaliza opciones y añade "Any"
  const statusOptions = useMemo(
    () =>
      [{ label: "Any status", value: "" }].concat(
        (options.statuses || []).map((s) => ({ label: s, value: s }))
      ),
    [options.statuses]
  );
  const speciesOptions = useMemo(
    () =>
      [{ label: "Any species", value: "" }].concat(
        (options.species || []).map((s) => ({ label: s, value: s }))
      ),
    [options.species]
  );
  const genderOptions = useMemo(
    () =>
      [{ label: "Any gender", value: "" }].concat(
        (options.genders || []).map((g) => ({ label: g, value: g }))
      ),
    [options.genders]
  );
  const sortOptions = useMemo(
    () => [
      { label: "A → Z", value: "asc" },
      { label: "Z → A", value: "desc" },
    ],
    []
  );

  return (
    <div
      className="
        rounded-xl border border-blue-900 bg-blue-100/90 backdrop-blur
        p-3 sm:p-4 shadow-sm
      "
    >
      {/* Bloque superior: búsqueda + favoritos (en columna en mobile) */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        {/* Search */}
        <div className="relative w-full sm:max-w-sm">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search characters by name"
            className="
              w-full rounded-lg border border-slate-300 bg-white
              pl-9 pr-3 py-2 text-xs sm:text-sm
              placeholder:text-slate-400
              focus:outline-none focus:ring-2 focus:ring-emerald-200
            "
          />
        </div>

        {/* Only favorites */}
        <FavSwitch checked={onlyFavs} onChange={onOnlyFavsChange} />
      </div>

      {/* Bloque inferior: selects en línea (se expanden en el flujo con animación) */}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <InlineSelect
          value={sortOrder}
          onChange={onSortOrderChange}
          options={sortOptions}
          title="Sort by name"
          allowClear={false}
        />
        <InlineSelect
          value={status}
          onChange={onStatusChange}
          options={statusOptions}
          title="Status"
        />
        <InlineSelect
          value={species}
          onChange={onSpeciesChange}
          options={speciesOptions}
          title="Species"
        />
        <InlineSelect
          value={gender}
          onChange={onGenderChange}
          options={genderOptions}
          title="Gender"
        />
      </div>
    </div>
  );
}
