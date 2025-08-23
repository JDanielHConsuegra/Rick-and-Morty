export default function FavoritesFilter({ checked, onChange }) {
  return (
    <label className="inline-flex select-none items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm">
      <input
        type="checkbox"
        className="h-4 w-4"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-label="Show only favorites"
      />
      <span>Only favorites</span>
    </label>
  );
}
