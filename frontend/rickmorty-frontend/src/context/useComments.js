import { useContext } from "react";
import { CommentsContext } from "./CommentsContext.js";

export function useComments() {
  const ctx = useContext(CommentsContext);
  if (!ctx) throw new Error("useComments must be used within CommentsProvider");
  return ctx;
}
