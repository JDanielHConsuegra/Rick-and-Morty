export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b bg-white">
        <div className="container flex items-center justify-between py-4">
          <h1 className="text-xl font-semibold">Rick & Morty</h1>
          <nav className="text-sm opacity-80">Frontend</nav>
        </div>
      </header>

      <main className="container py-6">{children}</main>

      <footer className="border-t bg-white">
        <div className="container py-4 text-sm opacity-70">
          GraphQL + React 18 + Tailwind
        </div>
      </footer>
    </div>
  );
}
