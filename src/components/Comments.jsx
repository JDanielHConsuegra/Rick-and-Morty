import { useMemo, useState, useCallback } from "react";
import { useComments } from "../context/useComments.js";

export default function Comments({ characterId }) {
  const { list, add, remove } = useComments();
  const [text, setText] = useState("");

  const comments = list(String(characterId));

  const sorted = useMemo(
    () =>
      [...comments].sort(
        (a, b) => new Date(a.createdAtISO) - new Date(b.createdAtISO)
      ),
    [comments]
  );

  const submit = useCallback(() => {
    const value = String(text).trim();
    if (!value) return;
    add(String(characterId), value);
    setText("");
  }, [text, add, characterId]);

  const onSubmit = (e) => {
    e.preventDefault();
    submit();
  };

  const onKeyDown = (e) => {
    // Enter => enviar ; Shift+Enter => nueva línea
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Comments</h3>

      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-2 sm:flex-row sm:items-start"
      >
        <textarea
          className="min-h-[80px] flex-1 rounded-md border bg-white p-2 text-sm"
          placeholder="Add a comment… (Enter to post, Shift+Enter for newline)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          aria-label="Add a comment"
        />
        <button
          type="submit"
          className="h-[40px] rounded-md border bg-slate-900 px-3 text-sm text-white transition hover:bg-slate-800"
        >
          Post
        </button>
      </form>

      <ul className="space-y-2">
        {sorted.length === 0 && (
          <li className="text-sm text-slate-500">No comments yet.</li>
        )}

        {sorted.map((c) => (
          <li key={c.id} className="rounded-md border bg-white p-3">
            <div className="flex items-start justify-between gap-3">
              <p className="whitespace-pre-wrap text-sm">{c.text}</p>
              <button
                type="button"
                onClick={() => remove(String(characterId), c.id)}
                className="rounded border px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
                aria-label="Delete comment"
                title="Delete"
              >
                Delete
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {new Date(c.createdAtISO).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
