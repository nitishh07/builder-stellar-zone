import { Header } from "./Header";
import { Footer } from "./Footer";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gradient-to-br from-muted/30 via-background to-muted/30">
        {children}
      </main>
      <Footer />
    </div>
  );
}
