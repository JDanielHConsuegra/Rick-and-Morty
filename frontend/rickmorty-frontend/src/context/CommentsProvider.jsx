import { useEffect, useMemo, useState } from "react";
import { CommentsContext, COMMENTS_STORAGE_KEY } from "./CommentsContext.js";

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID)
    return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function CommentsProvider({ children }) {
  const [byId, setById] = useState(() => {
    try {
      const raw = localStorage.getItem(COMMENTS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      if (import.meta.env.DEV)
        console.warn("Comments: failed to read storage", e);
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(byId));
    } catch (e) {
      if (import.meta.env.DEV)
        console.warn("Comments: failed to write storage", e);
    }
  }, [byId]);

  const value = useMemo(
    () => ({
      list: (characterId) => {
        const key = String(characterId ?? "");
        const arr = byId[key];
        return Array.isArray(arr) ? arr : [];
      },
      add: (characterId, text) => {
        const key = String(characterId ?? "");
        const value = String(text ?? "").trim();
        if (!key || !value) {
          if (import.meta.env.DEV)
            console.warn("Comments.add skipped (empty key/text)");
          return;
        }
        setById((curr) => {
          const arr = Array.isArray(curr[key]) ? curr[key] : [];
          const next = {
            id: makeId(),
            text: value,
            createdAtISO: new Date().toISOString(),
          };
          return { ...curr, [key]: [...arr, next] };
        });
      },
      remove: (characterId, commentId) => {
        const key = String(characterId ?? "");
        const cid = String(commentId ?? "");
        if (!key || !cid) return;
        setById((curr) => {
          const arr = Array.isArray(curr[key]) ? curr[key] : [];
          return { ...curr, [key]: arr.filter((c) => c.id !== cid) };
        });
      },
      clearAllFor: (characterId) => {
        const key = String(characterId ?? "");
        if (!key) return;
        setById((curr) => ({ ...curr, [key]: [] }));
      },
    }),
    [byId]
  );

  return (
    <CommentsContext.Provider value={value}>
      {children}
    </CommentsContext.Provider>
  );
}
