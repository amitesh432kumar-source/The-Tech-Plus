import Link from "next/link";
import { Calendar, Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { WebinarSummary } from "@/types/content";

export function WebinarCard({ webinar }: { webinar: WebinarSummary }) {
  const seatsLeft = webinar.seatsTotal - webinar.seatsTaken;
  const almostFull = seatsLeft > 0 && seatsLeft <= webinar.seatsTotal * 0.15;

  const formattedDate = new Date(webinar.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Card className="card-hover overflow-hidden border-border ring-0">
      <div className="relative flex aspect-[16/9] items-center justify-center bg-gradient-brand text-white">
        <Badge className="absolute left-3 top-3 bg-background/90 text-foreground capitalize">
          {webinar.status}
        </Badge>
        <span className="text-sm font-medium opacity-80">Live Webinar</span>
      </div>
      <CardHeader>
        <CardTitle className="text-base">{webinar.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {webinar.description}
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="size-3.5" /> {formattedDate}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" /> {webinar.time}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5" />
            {almostFull ? `${seatsLeft} seats left` : "Seats available"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">Speaker: {webinar.speaker}</p>
      </CardContent>
      <CardFooter className="mt-2 flex items-center justify-between border-none bg-transparent px-(--card-spacing) pb-(--card-spacing)">
        <span className="text-lg font-bold">
          {webinar.price === "free" ? "Free" : `₹${webinar.price}`}
        </span>
        <Button size="sm" render={<Link href={`/webinars/${webinar.slug}`} />}>
          Register Now
        </Button>
      </CardFooter>
    </Card>
  );
}
