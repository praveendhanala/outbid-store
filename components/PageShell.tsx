import { Header } from "./Header";
import { Footer } from "./Footer";

export function PageShell({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <Header />
      <div className="py-10">
        <h1 className="font-display mb-2 text-3xl font-bold">{title}</h1>
        {intro && <p className="mb-8 max-w-lg text-sm text-muted">{intro}</p>}
        <div className="flex flex-col gap-6 text-sm leading-relaxed text-foreground [&_h2]:font-display [&_h2]:mt-2 [&_h2]:mb-1 [&_h2]:text-base [&_h2]:font-bold [&_p]:text-muted [&_li]:text-muted">
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
}
