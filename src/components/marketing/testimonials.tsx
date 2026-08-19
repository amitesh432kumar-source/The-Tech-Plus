import { Star } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { listApprovedTestimonials } from "@/services/testimonials";

export async function Testimonials() {
  const testimonials = await listApprovedTestimonials(6);

  if (testimonials.length === 0) return null;

  return (
    <section className="border-b border-border">
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">What Students Say</h2>
          <p className="mt-2 text-muted-foreground">
            Feedback from students who have taken courses on The Tech Plus.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, i) => (
            <Card key={i} className="border-border ring-0">
              <CardHeader>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, star) => (
                    <Star
                      key={star}
                      className={`size-4 ${
                        star < testimonial.rating
                          ? "fill-current text-[var(--brand-purple)]"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-foreground/90">&ldquo;{testimonial.quote}&rdquo;</p>
                <div>
                  <p className="text-sm font-semibold">{testimonial.studentName}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.course}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
