import { LoadingState } from "@/components/ui/states";
import { Container, Section } from "@/components/ui/layout";

/** Squelette du chargement de l'annuaire — la structure est réservée d'emblée. */
export default function TalentsLoading() {
  return (
    <Section spacing="sm">
      <Container size="wide">
        <div className="grid gap-8 lg:grid-cols-[17rem_1fr] lg:gap-10">
          <div aria-hidden="true" className="border-border bg-surface hidden h-96 rounded-xl border p-5 lg:block">
            <div className="bg-surface-muted h-4 w-1/2 animate-pulse rounded" />
            <div className="bg-surface-muted mt-4 h-11 w-full animate-pulse rounded-md" />
            <div className="bg-surface-muted mt-4 h-11 w-full animate-pulse rounded-md" />
            <div className="bg-surface-muted mt-4 h-11 w-full animate-pulse rounded-md" />
          </div>
          <LoadingState label="Chargement de l'annuaire des talents" rows={4} />
        </div>
      </Container>
    </Section>
  );
}
