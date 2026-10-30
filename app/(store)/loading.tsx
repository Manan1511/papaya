import { Container } from "../../components/ui/container";
import { Grid } from "../../components/ui/grid";

export default function Loading() {
  return (
    <Container className="space-y-lg py-lg" aria-busy="true">
      <div className="h-10 w-48 animate-pulse rounded bg-surface-container-high" />
      <Grid>
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="col-span-2 space-y-3 md:col-span-4 lg:col-span-3">
            <div className="aspect-[4/5] animate-pulse rounded-lg bg-surface-container-high" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-surface-container-high" />
          </div>
        ))}
      </Grid>
    </Container>
  );
}
