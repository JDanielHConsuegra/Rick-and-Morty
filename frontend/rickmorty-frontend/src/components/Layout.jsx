import { SiApollographql, SiReact, SiTailwindcss } from "react-icons/si";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen text-slate-900">
      {/* Header “glass” fijo, con borde sutil */}
      <header className="sticky top-0 z-40 border-b-2 border-slate-600/60 bg-blue-200/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-screen-xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <img className="h-15 lg:h-25" src="/Rick&MortyLogo.png" alt="Logo" />
          <div className="flex flex-col">
            <h1 className="text-2xl font-semibold leading-tight lg:text-4xl">
              <span className="bg-gradient-to-r from-blue-800 to-slate-900 bg-clip-text text-transparent">
                Rick & Morty
              </span>
            </h1>
            <p className="mt-1 text-xs text-slate-700">
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
            <span className="inline-flex items-center gap-2 rounded-full border-b-2 border-slate-600/60 bg-white/70 px-3 py-1 text-xs text-slate-600">
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
      <footer className="border-t-2 border-slate-600/60 bg-blue-200/70 backdrop-blur">
        <div className="mx-auto w-full max-w-screen-xl px-4 py-4 text-xs text-slate-900 font-bold sm:px-6 lg:px-8">
          © {new Date().getFullYear()} — Demo UI. Built with care.
        </div>
      </footer>
    </div>
  );
}
