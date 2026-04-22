import ScrollExpandMedia from "@/components/ui/scroll-expansion-hero";

export const metadata = {
  title: "Expand Hero — JETS Sandbox",
};

export default function SandboxExpandPage() {
  return (
    <div className="min-h-screen bg-[#0f0d0a] text-white">
      <ScrollExpandMedia
        mediaType="image"
        mediaSrc="https://www.jetsschool.org/wp-content/uploads/2020/10/jets_new_campus1.jpg"
        bgImageSrc="https://www.jetsschool.org/wp-content/uploads/2020/10/jets_new_campus3.jpg"
        title="Welcome to JETS"
        date="Granada Hills, California"
        scrollToExpand="Scroll to discover"
        textBlend
      >
        <div className="max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-[0.25em] text-white/50 mb-6">
            About
          </p>
          <h2 className="font-serif text-4xl lg:text-6xl text-white mb-10 tracking-tight leading-[1.05]">
            A school for young men who are{" "}
            <em className="italic font-[family-name:var(--font-editorial-display)] text-[#e8c476]">
              ready to build something.
            </em>
          </h2>
          <p className="text-lg lg:text-xl text-white/70 leading-relaxed mb-6">
            Established in 2008 on a stubborn premise: that a young man can be
            formed at once in the study of Torah and in a useful trade — and
            neither aspiration need be diminished to accommodate the other.
          </p>
          <p className="text-lg lg:text-xl text-white/70 leading-relaxed mb-12">
            Sixteen years later, JETS sits on nine and a half acres in the
            foothills of the San Gabriel Valley, having quietly sent eight
            hundred and twelve graduates into fifty-seven disciplines.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 pt-12 border-t border-white/10">
            {[
              { number: "812+", label: "Graduates" },
              { number: "57", label: "Courses" },
              { number: "16+", label: "Years" },
              { number: "9.5", label: "Acres" },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-serif text-4xl lg:text-5xl text-white">
                  {s.number}
                </div>
                <div className="mt-1 text-xs uppercase tracking-[0.2em] text-white/50">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 flex flex-col sm:flex-row gap-3">
            <a
              href="/sandbox"
              className="inline-flex items-center justify-center gap-2 h-11 rounded-md px-8 text-sm font-medium border border-white/20 text-white hover:bg-white/10 transition-colors"
            >
              Back to Sandbox Home
            </a>
            <a
              href="/sandbox/photos"
              className="inline-flex items-center justify-center gap-2 h-11 rounded-md px-8 text-sm font-medium bg-white text-black hover:bg-white/90 transition-colors"
            >
              View Photo Gallery →
            </a>
          </div>
        </div>
      </ScrollExpandMedia>
    </div>
  );
}
