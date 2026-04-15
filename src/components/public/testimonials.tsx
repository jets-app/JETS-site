import { Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const testimonials = [
  {
    quote:
      "I formed partnerships with classmates and mentors, creating an incredible network.",
    name: "Koby Lerner",
    title: "Funding Specialist, Gold Funding Group",
    initials: "KL",
    color: "bg-blue-500",
  },
  {
    quote: "I came for my GED but found my career path instead.",
    name: "Mendel Rubashkin",
    title: "Mortgage Banker, First Reliant Home Loans",
    initials: "MR",
    color: "bg-emerald-500",
  },
  {
    quote:
      "The confidence and drive started at JETS and will stay with me.",
    name: "Sam Liberow",
    title: "VP Investments, Marcus & Millichap",
    initials: "SL",
    color: "bg-amber-500",
  },
  {
    quote: "Individualized courses suited my ability perfectly.",
    name: "Nuchom Levitansky",
    title: "Ambulance Operations Manager",
    initials: "NL",
    color: "bg-violet-500",
  },
  {
    quote: "JETS made my goal of becoming an accountant a reality.",
    name: "Motty Vogel",
    title: "Financial Director",
    initials: "MV",
    color: "bg-rose-500",
  },
];

interface TestimonialsProps {
  heading?: string;
  subheading?: string;
  badge?: string;
  className?: string;
}

export function Testimonials({
  heading = "Hear From Our Alumni",
  subheading = "Real graduates, real careers. The JETS experience speaks through those whose lives it shaped.",
  badge = "Testimonials",
  className = "",
}: TestimonialsProps) {
  return (
    <section className={`py-20 lg:py-28 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            {badge}
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
            {heading}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {subheading}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="relative bg-card rounded-2xl border border-border/50 p-8 hover:border-primary/15 hover:shadow-lg transition-all duration-500 flex flex-col"
            >
              <Quote className="h-8 w-8 text-primary/15 mb-4" />
              <p className="text-sm text-foreground/80 leading-relaxed flex-1 italic">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-6 pt-6 border-t border-border/50">
                <div
                  className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-bold`}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {t.title}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
