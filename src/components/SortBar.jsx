export default function SortBar({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-slate-600">Sort:</label>
      <select
        className="rounded-md border bg-white px-2 py-1 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="asc">Name (A → Z)</option>
        <option value="desc">Name (Z → A)</option>
      </select>
    </div>
  );
}
