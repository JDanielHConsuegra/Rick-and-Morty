import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { test, vi, expect } from "vitest";
import Comments from "../Comments.jsx";

// Mock de useComments con un pequeño store en memoria + “force rerender”
vi.mock("../../context/useComments.js", async () => {
  const React = await import("react");
  const store = new Map(); // id -> array de comments

  return {
    useComments: () => {
      const [, setTick] = React.useState(0);
      const force = () => setTick((t) => t + 1);

      const list = (id) => store.get(String(id)) || [];
      const add = (id, text) => {
        const key = String(id);
        const arr = store.get(key) || [];
        const newItem = {
          id: Math.random().toString(36).slice(2, 8),
          text,
          createdAtISO: new Date().toISOString(),
        };
        store.set(key, [...arr, newItem]);
        force();
      };
      const remove = (id, commentId) => {
        const key = String(id);
        const arr = store.get(key) || [];
        store.set(
          key,
          arr.filter((c) => c.id !== commentId)
        );
        force();
      };

      return { list, add, remove };
    },
  };
});

test("posts a comment with Enter and deletes it", async () => {
  const u = userEvent.setup();
  render(<Comments characterId="abc" />);

  // Estado inicial: sin comentarios
  expect(screen.getByText(/no comments yet/i)).toBeInTheDocument();

  // Escribir comentario y enviar con Enter (sin Shift)
  const textarea = screen.getByLabelText(/add a comment/i);
  await u.type(textarea, "Hello there{enter}");

  // El comentario debe aparecer
  const comment = await screen.findByText("Hello there");
  expect(comment).toBeInTheDocument();

  // Eliminar el comentario
  const delBtn = screen.getByRole("button", { name: /delete comment/i });
  await u.click(delBtn);

  // Vuelve al estado vacío
  expect(screen.getByText(/no comments yet/i)).toBeInTheDocument();
});
