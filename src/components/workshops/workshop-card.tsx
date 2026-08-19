import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { WorkshopSummary } from "@/types/content";

const typeLabel: Record<WorkshopSummary["type"], string> = {
  workshop: "Workshop",
  bootcamp: "Bootcamp",
  "live-class": "Live Class",
  event: "Event",
};

export function WorkshopCard({ workshop }: { workshop: WorkshopSummary }) {
  return (
    <Card className="card-hover border-border ring-0 bg-gradient-to-br from-card to-muted/40">
      <CardHeader>
        <Badge variant="secondary" className="w-fit">
          {typeLabel[workshop.type]}
        </Badge>
        <CardTitle className="text-base">{workshop.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="line-clamp-2 text-sm text-muted-foreground">{workshop.description}</p>
        <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <CalendarClock className="size-3.5" />
          {new Date(workshop.date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}{" "}
          · {workshop.durationHours}h
        </div>
      </CardContent>
      <CardFooter className="mt-2 border-none bg-transparent px-(--card-spacing) pb-(--card-spacing)">
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          render={<Link href={`/workshops/${workshop.slug}`} />}
        >
          Learn More
        </Button>
      </CardFooter>
    </Card>
  );
}
