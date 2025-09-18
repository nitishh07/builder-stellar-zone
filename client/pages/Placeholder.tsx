import { AppShell } from "@/components/layout/AppShell";

export default function Placeholder({ title }: { title: string }) {
  return (
    <AppShell>
      <section className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-2 px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="max-w-xl text-muted-foreground">This section is part of the prototype. Ask to fill in this page with the required functionality and UI when you are ready.</p>
      </section>
    </AppShell>
  );
}
