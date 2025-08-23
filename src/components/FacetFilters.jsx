export default function FacetFilters({
  status,
  species,
  gender,
  onChangeStatus,
  onChangeSpecies,
  onChangeGender,
  options,
}) {
  const statuses = options?.statuses ?? [];
  const speciesList = options?.species ?? [];
  const genders = options?.genders ?? [];

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      {/* Status */}
      <label className="inline-flex items-center gap-2 text-sm">
        <span className="text-slate-600">Status:</span>
        <select
          className="rounded-md border bg-white px-2 py-1 text-sm"
          value={status}
          onChange={(e) => onChangeStatus(e.target.value)}
        >
          <option value="">All</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      {/* Species */}
      <label className="inline-flex items-center gap-2 text-sm">
        <span className="text-slate-600">Species:</span>
        <select
          className="rounded-md border bg-white px-2 py-1 text-sm"
          value={species}
          onChange={(e) => onChangeSpecies(e.target.value)}
        >
          <option value="">All</option>
          {speciesList.map((sp) => (
            <option key={sp} value={sp}>
              {sp}
            </option>
          ))}
        </select>
      </label>

      {/* Gender */}
      <label className="inline-flex items-center gap-2 text-sm">
        <span className="text-slate-600">Gender:</span>
        <select
          className="rounded-md border bg-white px-2 py-1 text-sm"
          value={gender}
          onChange={(e) => onChangeGender(e.target.value)}
        >
          <option value="">All</option>
          {genders.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
