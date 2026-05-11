import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";

interface Crumb { label: string; href: string; }

interface PageHeroProps {
  label?: string;
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
}

export function PageHero({ label, title, description, breadcrumbs }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-accent py-14 text-accent-foreground md:py-20">

      {/* Dot texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }}
      />

      {/* Ambient glow */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-1/4 -top-1/2 aspect-square w-[500px] rounded-full bg-primary/20 blur-[100px]" />
      </div>

      <div className="container relative">

        {/* Breadcrumb */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1 text-xs text-white/40">
              <li>
                <Link href="/" className="transition-colors hover:text-white">Home</Link>
              </li>
              {breadcrumbs.map((crumb, i) => (
                <li key={crumb.href} className="flex items-center gap-1">
                  <ChevronRight size={12} aria-hidden="true" className="opacity-40" />
                  {i === breadcrumbs.length - 1 ? (
                    <span className="text-white/70" aria-current="page">{crumb.label}</span>
                  ) : (
                    <Link href={crumb.href} className="transition-colors hover:text-white">{crumb.label}</Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        <Reveal>
          {label && (
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-primary" aria-hidden="true" />
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{label}</p>
            </div>
          )}
          <h1 className="font-serif text-4xl font-semibold leading-tight text-white md:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/60 md:text-lg">
              {description}
            </p>
          )}
        </Reveal>

      </div>
    </section>
  );
}
