export default function FavoritesFilter({ checked, onChange }) {
  return (
    <label className="inline-flex cursor-pointer select-none items-center gap-2 border shadow-md shadow-gray-200 rounded-2xl px-3 py-2 text-sm">
      <input
        type="checkbox"
        className="h-4 placeholder:italic w-4"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-label="Show only favorites"
      />
      <span className="text-gray-200 font-bold italic">Only favorites</span>
    </label>
  );
}
