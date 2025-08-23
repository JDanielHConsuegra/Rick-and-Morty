import { createContext } from "react";

export const CommentsContext = createContext(null);
export const COMMENTS_STORAGE_KEY = "comments:v1";
// Estructura en storage: { [characterId: string]: Array<{ id, text, createdAtISO }> }
