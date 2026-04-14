export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-background via-background to-accent/30">
      {/* Left side - Immersive Branding Panel */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden">
        {/* Multi-layer gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#8B0015] via-primary to-[#5C0010]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />

        {/* Geometric pattern overlay */}
        <div className="absolute inset-0 opacity-[0.07]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="diamonds" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M30 0 L60 30 L30 60 L0 30Z" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#diamonds)" />
          </svg>
        </div>

        {/* Decorative geometric shapes */}
        <div className="absolute -top-24 -right-24 w-[500px] h-[500px] rounded-full border border-white/[0.08]" />
        <div className="absolute -top-12 -right-12 w-[400px] h-[400px] rounded-full border border-white/[0.05]" />
        <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] rounded-full border border-white/[0.06]" />
        <div className="absolute bottom-20 right-16 w-48 h-48 rounded-full bg-white/[0.04]" />
        <div className="absolute top-1/3 -left-8 w-32 h-32 rounded-full bg-white/[0.03]" />

        {/* Subtle vertical lines */}
        <div className="absolute top-0 right-[30%] w-px h-full bg-gradient-to-b from-transparent via-white/10 to-transparent" />
        <div className="absolute top-0 right-[60%] w-px h-full bg-gradient-to-b from-transparent via-white/[0.06] to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between py-12 px-12 xl:px-16 w-full">
          {/* Top - Logo area */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <span className="text-white font-bold text-lg">J</span>
              </div>
              <div className="h-6 w-px bg-white/20" />
              <span className="text-white/70 text-sm font-medium tracking-wider uppercase">
                Est. Granada Hills, LA
              </span>
            </div>
          </div>

          {/* Center - Main branding */}
          <div className="space-y-8">
            <div>
              <h1 className="text-5xl xl:text-6xl font-bold tracking-tight text-white leading-[1.1]">
                JETS
                <span className="block text-3xl xl:text-4xl font-light text-white/80 mt-2">
                  School
                </span>
              </h1>
              <div className="flex items-center gap-4 mt-6">
                <div className="w-12 h-[2px] bg-white/40" />
                <span className="text-white/50 text-xs font-medium tracking-[0.2em] uppercase">
                  Torah V&apos;Avodah
                </span>
              </div>
            </div>

            <p className="text-lg xl:text-xl text-white/75 max-w-md leading-relaxed font-light">
              Jewish Educational Trade School &mdash; combining Judaic studies
              with vocational training to build futures of purpose and skill.
            </p>

            {/* Feature highlights */}
            <div className="grid grid-cols-2 gap-4 max-w-md">
              <div className="rounded-xl bg-white/[0.08] backdrop-blur-sm border border-white/[0.1] px-4 py-3">
                <div className="text-white/90 text-sm font-medium">Judaic Studies</div>
                <div className="text-white/50 text-xs mt-0.5">Torah-centered learning</div>
              </div>
              <div className="rounded-xl bg-white/[0.08] backdrop-blur-sm border border-white/[0.1] px-4 py-3">
                <div className="text-white/90 text-sm font-medium">Trade Skills</div>
                <div className="text-white/50 text-xs mt-0.5">Real-world vocations</div>
              </div>
            </div>
          </div>

          {/* Bottom - Contact */}
          <div className="flex items-center gap-6 text-sm text-white/50">
            <span>Granada Hills, Los Angeles, CA</span>
            <div className="w-1 h-1 rounded-full bg-white/30" />
            <span>(818) 831-3000</span>
          </div>
        </div>

        {/* Right edge fade for seamless transition */}
        <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-background/10 to-transparent" />
      </div>

      {/* Right side - Form area */}
      <div className="w-full lg:w-[48%] flex items-center justify-center p-6 sm:p-8 lg:p-12 relative">
        {/* Subtle dot pattern on form side */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        <div className="w-full max-w-[440px] relative z-10">{children}</div>
      </div>
    </div>
  );
}
