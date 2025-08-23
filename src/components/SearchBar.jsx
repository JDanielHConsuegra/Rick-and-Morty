export default function SearchBar({
  value,
  onChange,
  placeholder = "Search by name (starts with)...",
}) {
  return (
    <div className="flex w-full max-w-md items-center gap-2">
      <input
        type="text"
        className="flex-1 rounded-md border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        aria-label="Search characters by name (starts with)"
      />
      {value?.length > 0 && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="rounded-md border bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Clear
        </button>
      )}
    </div>
  );
}
