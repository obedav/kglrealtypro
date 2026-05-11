import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ConciergeChat } from "@/components/ConciergeChat";
import { PageHero } from "@/components/PageHero";
import { getAgents } from "@/lib/data";

export const metadata = { title: "Agents" };
export const revalidate = 600;

export default async function AgentsPage() {
  const agents = await getAgents();

  return (
    <>
      <Header />
      <PageHero
        label="The team"
        title="Our agents"
        description="A small team of licensed brokers with deep knowledge of luxury property in Nigeria, the UAE, and the UK."
        breadcrumbs={[{ label: "Agents", href: "/agents" }]}
      />

      <main className="container py-14">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {agents.map((agent) => {
            const initials = agent.fullName
              .split(" ").filter(Boolean).map((n) => n[0]).slice(0, 2).join("").toUpperCase();
            return (
              <Link key={agent.id} href={`/agents/${agent.slug}`} className="group block outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-2xl">
                <div className="overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl group-hover:shadow-black/[0.07]">

                  {/* Accent bar */}
                  <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent" />

                  {/* Photo */}
                  <div className="relative aspect-[3/3.5] overflow-hidden bg-gradient-to-br from-primary/10 to-accent/20">
                    {agent.photo ? (
                      <Image
                        src={agent.photo}
                        alt={agent.fullName}
                        fill
                        sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-serif text-6xl font-bold text-primary/30">{initials}</span>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card to-transparent" />
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <h3 className="font-serif text-lg font-semibold">{agent.fullName}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">{agent.role}</p>
                    {agent.specialties.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {agent.specialties.slice(0, 2).map((s) => (
                          <span key={s} className="rounded-full border bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-4 grid grid-rows-[0fr] opacity-0 transition-all duration-300 group-hover:grid-rows-[1fr] group-hover:opacity-100">
                      <div className="overflow-hidden">
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline">
                          View profile <ArrowRight size={13} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      <Footer />
      <ConciergeChat />
    </>
  );
}
