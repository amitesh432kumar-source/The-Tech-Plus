import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { demoInstructors } from "@/config/demo-data";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Instructors() {
  return (
    <section className="border-b border-border bg-muted/30">
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Learn From Instructors</h2>
          <p className="mt-2 text-muted-foreground">
            Instructors bring real, practical experience into every course and session.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {demoInstructors.map((instructor) => (
            <Card key={instructor.slug} className="card-hover border-border ring-0">
              <CardHeader className="flex-row items-center gap-3">
                <Avatar size="lg">
                  <AvatarFallback>{initials(instructor.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{instructor.name}</p>
                  <p className="text-xs text-muted-foreground">{instructor.expertise}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{instructor.bio}</p>
                <p className="text-xs font-medium text-[var(--brand-blue)]">
                  {instructor.courseCount} courses
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
