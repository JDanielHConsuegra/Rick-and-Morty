import { SiApollographql, SiReact, SiTailwindcss } from "react-icons/si";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen text-slate-900">
      {/* Header “glass” fijo, con borde sutil */}
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-screen-xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col">
            <h1 className="text-2xl font-semibold leading-tight sm:text-3xl">
              <span className="bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                Rick & Morty
              </span>
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              <a
                className="hover:underline"
                href="https://my-portfolio-gold-omega-72.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
              >
                By Juan Daniel
              </a>
            </p>
          </div>

          {/* Espacio para acciones futuras (ej. botón de tema) */}
          <div className="hidden sm:block">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-3 py-1 text-xs text-slate-600">
              <SiApollographql /> GraphQL • <SiReact /> React 18 •{" "}
              <SiTailwindcss /> Tailwind
            </span>
          </div>
        </div>
      </header>

      {/* Contenido principal con el mismo ancho que el header */}
      <main className="mx-auto w-full max-w-screen-xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer ligero */}
      <footer className="border-t border-slate-200/60 bg-white/60">
        <div className="mx-auto w-full max-w-screen-xl px-4 py-4 text-xs text-slate-600 sm:px-6 lg:px-8">
          © {new Date().getFullYear()} — Demo UI. Built with care.
        </div>
      </footer>
    </div>
  );
}
