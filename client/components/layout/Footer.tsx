export function Footer() {
  return (
    <footer className="border-t bg-background/70">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 text-xs text-muted-foreground sm:px-6 lg:px-8">
        <p>Hackathon Prototype — Powered by ML, Built for Early Intervention</p>
        <p className="hidden sm:block">© {new Date().getFullYear()} SRMCS</p>
      </div>
    </footer>
  );
}
