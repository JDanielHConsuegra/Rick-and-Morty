export default function SortBar({ value, onChange }) {
  return (
    <div className="flex cursor-pointer flex-col p-2 shadow-md shadow-gray-200 rounded-2xl items-center">
      <label className="text-sm font-bold text-slate-200">Sort:</label>
      <select
        className="rounded-xl border text-gray-800 bg-gray-100/80 px-2 py-1 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option className="rounded-xl" value="asc">
          Name (A → Z)
        </option>
        <option className="rounded-xl" value="desc">
          Name (Z → A)
        </option>
      </select>
    </div>
  );
}
