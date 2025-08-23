import { useMemo, useState, useCallback } from "react";
import { AiOutlineSend } from "react-icons/ai";
import { FiTrash2 } from "react-icons/fi";
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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="mx-auto w-full max-w-lg space-y-4">
      <h3 className="text-center text-base font-semibold text-slate-800">
        Comments
      </h3>

      {/* Form */}
      <form onSubmit={onSubmit} className="mx-auto w-full space-y-2">
        <textarea
          className="min-h-[64px] w-full rounded-xl border bg-white/90 p-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          placeholder="Write a comment… (Enter to post, Shift+Enter for newline)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          aria-label="Add a comment"
        />
        <div className="flex justify-center">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-900 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
            title="Post comment"
            aria-label="Post comment"
          >
            <AiOutlineSend />
            <span>Post</span>
          </button>
        </div>
      </form>

      {/* List */}
      <ul className="mx-auto w-full space-y-2">
        {sorted.length === 0 && (
          <li className="text-center text-sm text-slate-500">
            No comments yet.
          </li>
        )}

        {sorted.map((c) => (
          <li key={c.id} className="rounded-xl border bg-white/90 p-3">
            <div className="flex items-start justify-between gap-3">
              <p className="whitespace-pre-wrap text-sm text-slate-800">
                {c.text}
              </p>
              <button
                type="button"
                onClick={() => remove(String(characterId), c.id)}
                className="inline-flex h-8 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white/90 px-3 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
                title="Delete comment"
                aria-label="Delete comment"
              >
                <FiTrash2 />
                Delete
              </button>
            </div>
            <p className="mt-1 text-[11px] leading-none text-slate-500">
              {new Date(c.createdAtISO).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
