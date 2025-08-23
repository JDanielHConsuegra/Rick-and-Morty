export default function SearchBar({
  value,
  onChange,
  placeholder = "Search by name (starts with)...",
}) {
  return (
    <div className="flex w-full max-w-md items-center gap-2">
      <input
        type="text"
        className="flex-1 placeholder:italic placeholder:text-gray-200 rounded-md border bg-gray-200/20 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
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
          className="rounded-md border bg-gray-500/70 px-3 py-2 text-sm text-slate-200 font-bold hover:bg-slate-50"
        >
          Clear
        </button>
      )}
    </div>
  );
}
