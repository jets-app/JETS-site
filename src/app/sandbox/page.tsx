import Link from "next/link";
import Image from "next/image";

export default function SandboxHome() {
  return (
    <div className="font-[family-name:var(--font-editorial)]">
      {/* ============ NAV ============ */}
      <SandboxNav />

      {/* ============ HERO ============ */}
      <section className="relative h-screen min-h-[700px] w-full overflow-hidden">
        {/* Background image with dark warm overlay */}
        <div className="absolute inset-0">
          <Image
            src="https://www.jetsschool.org/wp-content/uploads/2019/01/cl__0040_c7-1024x576.jpg"
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[#0f0d0a]/65" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0f0d0a] via-[#0f0d0a]/40 to-transparent" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 h-full flex flex-col">
          <div className="flex-1" />
          <div className="max-w-[1400px] w-full mx-auto px-6 lg:px-12 pb-20 lg:pb-28">
            <p className="text-xs uppercase tracking-[0.25em] text-white/60 mb-6 font-[family-name:var(--font-sans)]">
              Granada Hills, California — Est. 2008
            </p>
            <h1 className="font-serif text-[64px] sm:text-[96px] lg:text-[140px] leading-[0.9] tracking-tight text-white max-w-[14ch]">
              Torah and trade,
              <br />
              <em className="italic font-[family-name:var(--font-editorial-display)] text-[#e8c476]">
                under one roof.
              </em>
            </h1>
            <div className="mt-12 flex items-center gap-6">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors"
              >
                Apply for 2026–27
                <span className="text-base">→</span>
              </Link>
              <Link
                href="#about"
                className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors font-[family-name:var(--font-sans)]"
              >
                About JETS
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ STATEMENT ============ */}
      <section id="about" className="bg-[#0f0d0a] text-white py-32 lg:py-44">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
            <div className="lg:col-span-3">
              <p className="text-xs uppercase tracking-[0.25em] text-white/50 font-[family-name:var(--font-sans)]">
                About
              </p>
            </div>
            <div className="lg:col-span-9">
              <p className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-[1.15] text-white/95 tracking-tight">
                JETS is where young men gain a real trade and a serious Torah
                education at the same time. Mornings in the beis medrash.
                Afternoons in the workshop. A clear path to a career, a
                community, and a life you&apos;d be proud of.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ STATS ROW ============ */}
      <section className="bg-[#0f0d0a] border-y border-white/10 py-20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {[
              { number: "812+", label: "Graduates" },
              { number: "57", label: "Courses" },
              { number: "16+", label: "Years" },
              { number: "9.5", label: "Acre Campus" },
            ].map((stat, i) => (
              <div key={stat.label} className={i > 0 ? "lg:border-l lg:border-white/10 lg:pl-8" : "lg:pl-0"}>
                <div className="font-serif text-6xl lg:text-7xl text-white tracking-tight">
                  {stat.number}
                </div>
                <div className="mt-2 text-xs uppercase tracking-[0.2em] text-white/50 font-[family-name:var(--font-sans)]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PROGRAMS — krinsky-style numbered list ============ */}
      <section className="bg-[#0f0d0a] py-32 lg:py-44">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
            <div className="lg:col-span-3">
              <p className="text-xs uppercase tracking-[0.25em] text-white/50 font-[family-name:var(--font-sans)]">
                Programs
              </p>
            </div>
            <div className="lg:col-span-9">
              <h2 className="font-serif text-5xl lg:text-7xl text-white tracking-tight leading-[1] max-w-[18ch]">
                Six paths.{" "}
                <em className="italic font-[family-name:var(--font-editorial-display)] text-[#e8c476]">
                  One mission.
                </em>
              </h2>
            </div>
          </div>

          <div className="border-t border-white/10">
            {[
              {
                num: "01",
                title: "Judaic Studies",
                desc: "Gemara, Chassidus, Halacha — taught in small chaburas by experienced Rabbeim.",
              },
              {
                num: "02",
                title: "Applied Technology",
                desc: "Web development, digital media, computer literacy — modern apprenticeship in the craft of making.",
              },
              {
                num: "03",
                title: "Skilled Trades",
                desc: "Construction, electrical, EMT — work of the hands and of service to the community.",
              },
              {
                num: "04",
                title: "Business & Enterprise",
                desc: "Entrepreneurship, accounting, marketing — build something durable that lasts.",
              },
              {
                num: "05",
                title: "Academic Foundations",
                desc: "High school diploma and GED prep. English, math, sciences — the grammar of a learned life.",
              },
              {
                num: "06",
                title: "The Wider Life",
                desc: "Culinary, music, martial arts, athletics — for the cultivation of the whole man.",
              },
            ].map((p) => (
              <Link
                key={p.num}
                href="/programs"
                className="group grid grid-cols-12 gap-6 py-8 lg:py-10 border-b border-white/10 hover:bg-white/[0.03] transition-colors -mx-4 px-4 lg:-mx-8 lg:px-8 rounded-lg"
              >
                <div className="col-span-2 lg:col-span-1 text-xs lg:text-sm text-white/50 font-[family-name:var(--font-sans)] tracking-wider pt-2">
                  {p.num}
                </div>
                <div className="col-span-10 lg:col-span-5">
                  <h3 className="font-serif text-2xl lg:text-4xl text-white tracking-tight group-hover:text-[#e8c476] transition-colors">
                    {p.title}
                  </h3>
                </div>
                <div className="col-span-12 lg:col-span-5 text-base lg:text-lg text-white/60 leading-relaxed">
                  {p.desc}
                </div>
                <div className="hidden lg:flex col-span-1 items-center justify-end text-white/30 group-hover:text-white transition-colors text-xl">
                  →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CAMPUS GALLERY — full-bleed ============ */}
      <section className="bg-[#0f0d0a] pb-32 lg:pb-44">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-3">
              <p className="text-xs uppercase tracking-[0.25em] text-white/50 font-[family-name:var(--font-sans)]">
                Life at JETS
              </p>
            </div>
            <div className="lg:col-span-9">
              <h2 className="font-serif text-5xl lg:text-7xl text-white tracking-tight leading-[1] max-w-[18ch]">
                Where{" "}
                <em className="italic font-[family-name:var(--font-editorial-display)] text-[#e8c476]">
                  craft meets
                </em>{" "}
                conviction.
              </h2>
            </div>
          </div>
        </div>

        {/* 4-up image gallery — legora style */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 lg:gap-2 px-1 lg:px-2">
          {[
            "https://www.jetsschool.org/wp-content/uploads/2019/01/cl__0045_c2-1024x576.jpg",
            "https://www.jetsschool.org/wp-content/uploads/2019/01/cl__0044_c3-1024x576.jpg",
            "https://www.jetsschool.org/wp-content/uploads/2019/01/cl__0041_c6-1024x576.jpg",
            "https://www.jetsschool.org/wp-content/uploads/2019/01/cl__0038_c9-1024x576.jpg",
          ].map((src, i) => (
            <div key={i} className="relative aspect-[3/4] overflow-hidden">
              <Image
                src={src}
                alt=""
                fill
                className="object-cover hover:scale-[1.02] transition-transform duration-700"
                sizes="(min-width: 1024px) 25vw, 50vw"
              />
            </div>
          ))}
        </div>
      </section>

      {/* ============ TESTIMONIAL — large editorial pull ============ */}
      <section className="bg-[#1a1612] py-32 lg:py-44">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="max-w-[1100px] mx-auto text-center">
            <p className="font-serif text-3xl sm:text-4xl lg:text-6xl text-white leading-[1.1] tracking-tight">
              <em className="italic font-[family-name:var(--font-editorial-display)] text-[#e8c476]">
                &ldquo;
              </em>
              JETS gave me a trade, a community, and the confidence to build a
              life I&apos;m genuinely proud of.
              <em className="italic font-[family-name:var(--font-editorial-display)] text-[#e8c476]">
                &rdquo;
              </em>
            </p>
            <div className="mt-12">
              <p className="text-base text-white font-medium">Mendel Rubashkin</p>
              <p className="text-sm text-white/50 mt-1 font-[family-name:var(--font-sans)] uppercase tracking-wider">
                Class of 2016 · Mortgage Banker
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FACULTY ROW ============ */}
      <section className="bg-[#0f0d0a] py-32 lg:py-44">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
            <div className="lg:col-span-3">
              <p className="text-xs uppercase tracking-[0.25em] text-white/50 font-[family-name:var(--font-sans)]">
                Faculty
              </p>
            </div>
            <div className="lg:col-span-9">
              <h2 className="font-serif text-5xl lg:text-7xl text-white tracking-tight leading-[1] max-w-[20ch]">
                Mentors who{" "}
                <em className="italic font-[family-name:var(--font-editorial-display)] text-[#e8c476]">
                  shape lives.
                </em>
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { initials: "MS", name: "Rabbi Mayer Schmukler", role: "Founding Director" },
              { initials: "RS", name: "Rabbi Sufrin", role: "Head of Judaic Studies" },
              { initials: "MH", name: "Matthew Hintze", role: "Trade Programs Director" },
            ].map((f) => (
              <div key={f.name}>
                <div className="aspect-[4/5] bg-gradient-to-br from-[#1a1612] to-[#2a221a] flex items-center justify-center mb-6">
                  <span className="font-serif text-7xl text-[#e8c476]/80">
                    {f.initials}
                  </span>
                </div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/50 font-[family-name:var(--font-sans)] mb-2">
                  {f.role}
                </p>
                <p className="font-serif text-2xl text-white">{f.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA — final ============ */}
      <section className="bg-[#0f0d0a] py-32 lg:py-44 border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
            <div className="lg:col-span-8">
              <h2 className="font-serif text-6xl lg:text-9xl text-white tracking-tight leading-[0.9]">
                Ready to{" "}
                <em className="italic font-[family-name:var(--font-editorial-display)] text-[#e8c476]">
                  begin?
                </em>
              </h2>
              <p className="mt-8 text-lg text-white/60 max-w-[500px]">
                Applications for the 2026–27 academic year are open. Start
                yours in under five minutes.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col gap-4 lg:items-end">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors w-full lg:w-auto"
              >
                Apply Now →
              </Link>
              <Link
                href="/inquire"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-white/20 text-white text-sm font-semibold hover:border-white/60 transition-colors w-full lg:w-auto"
              >
                Schedule a Visit
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-[#0a0807] border-t border-white/10 pt-20 pb-12">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 mb-20">
            <div className="col-span-2 lg:col-span-4">
              <Link href="/sandbox" className="font-serif text-3xl text-white tracking-tight">
                JETS
              </Link>
              <p className="mt-4 text-sm text-white/50 max-w-[280px] leading-relaxed">
                Jewish Educational Trade School. Granada Hills, California.
                Est. 2008.
              </p>
            </div>
            <div className="lg:col-span-2">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40 font-[family-name:var(--font-sans)] mb-4">
                School
              </p>
              <ul className="space-y-3 text-sm text-white/70">
                <li><Link href="/about">About</Link></li>
                <li><Link href="/programs">Programs</Link></li>
                <li><Link href="/faculty">Faculty</Link></li>
              </ul>
            </div>
            <div className="lg:col-span-2">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40 font-[family-name:var(--font-sans)] mb-4">
                Admissions
              </p>
              <ul className="space-y-3 text-sm text-white/70">
                <li><Link href="/inquire">Inquire</Link></li>
                <li><Link href="/register">Apply</Link></li>
                <li><Link href="/contact">Visit</Link></li>
              </ul>
            </div>
            <div className="lg:col-span-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40 font-[family-name:var(--font-sans)] mb-4">
                Get in Touch
              </p>
              <address className="not-italic text-sm text-white/70 space-y-1 leading-relaxed">
                16601 Rinaldi Street<br />
                Granada Hills, CA 91344<br />
                <a href="tel:+18188313000" className="hover:text-white transition-colors">
                  (818) 831-3000
                </a>
              </address>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-4 text-xs text-white/40 font-[family-name:var(--font-sans)]">
            <span>© {new Date().getFullYear()} JETS College. All rights reserved.</span>
            <span>Designed with conviction in Granada Hills.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SandboxNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 lg:px-12 py-6">
      <div className="flex items-center justify-between max-w-[1400px] mx-auto">
        <Link href="/sandbox" className="font-serif text-2xl text-white tracking-tight">
          JETS
        </Link>
        <div className="hidden md:flex items-center gap-10 text-sm text-white/80 font-[family-name:var(--font-sans)]">
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
          <Link href="/programs" className="hover:text-white transition-colors">Programs</Link>
          <Link href="/faculty" className="hover:text-white transition-colors">Faculty</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
        </div>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors"
        >
          Apply
        </Link>
      </div>
    </nav>
  );
}
