import Image from "next/image";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";

export const metadata = {
  title: "About",
  description:
    "The history, mission, and founding principles of the Jewish Educational Trade School.",
};

const coreValues = [
  {
    title: "Torah",
    subtitle: "The foundation of everything",
    body: "Morning Torah study anchors the day. Gemara, Chassidut, Halacha, and Tanach taught in small groups by Rabbeim who know every student personally.",
  },
  {
    title: "Shekeidah",
    subtitle: "Perseverance",
    body: "A half-finished job is a job not done. Students learn to push through, whether it is a page of Talmud or a wiring project.",
  },
  {
    title: "Yichudiyut",
    subtitle: "Individual identity",
    body: "Every student is different. JETS does not flatten those differences. We refine them, so each graduate leaves knowing exactly who he is.",
  },
  {
    title: "Chiddush VeYetzirah",
    subtitle: "Innovation and creation",
    body: "A trade is not static. Students learn to think, question, and build better solutions, not just follow instructions.",
  },
  {
    title: "Chaim Amitiyim",
    subtitle: "A real life",
    body: "Everything leads here: a life of integrity with family, community, and purpose. That is the whole point.",
  },
];

export default function AboutPage() {
  return (
    <>
      <SiteNav />

      {/* Hero */}
      <section className="relative pt-20 lg:pt-24">
        <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
          <Image
            src="https://www.jetsschool.org/wp-content/uploads/2020/10/jets_new_campus1.jpg"
            alt="JETS campus"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 h-full flex items-center justify-center">
            <div className="text-center px-6">
              <p className="text-sm font-semibold uppercase tracking-wider text-white/70 mb-4">
                Est. 2008
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
                About JETS
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* History */}
      <section className="py-20 lg:py-28">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-[var(--jet-primary)] mb-4">
                Our Story
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--jet-text)] leading-tight">
                Built on a simple idea: Torah and trade go together.
              </h2>
              <div className="mt-6 space-y-4 text-lg text-[var(--jet-text-muted)] leading-relaxed">
                <p>
                  In 2008, Rabbi Mayer Schmukler opened JETS with 32 students in
                  a rented space in the San Fernando Valley. The idea was
                  straightforward: young Jewish men should not have to choose
                  between Torah learning and practical career training.
                </p>
                <p>
                  Sixteen years later, the school sits on 9.5 acres in Granada
                  Hills. Over 812 graduates have gone on to careers in trades,
                  tech, business, and beyond. The Fisch Trade School expansion
                  added four purpose-built buildings for workshops and
                  classrooms.
                </p>
                <p>
                  What has not changed is the core premise: form a young man in
                  both Torah and a useful trade, and he will be a better citizen,
                  a better Jew, and a better man.
                </p>
              </div>
            </div>
            <div>
              <Image
                src="https://www.jetsschool.org/wp-content/uploads/2020/10/jets_new_campus2.jpg"
                alt="JETS campus rendering"
                width={640}
                height={440}
                className="rounded-2xl object-cover w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 lg:py-28 bg-[var(--jet-bg-subtle)]">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-wider text-[var(--jet-primary)] mb-4">
              Our Values
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--jet-text)]">
              Five principles that guide everything
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreValues.map((value, i) => (
              <div
                key={value.title}
                className={`bg-white rounded-2xl p-8 border border-[var(--jet-border)] ${
                  i === 4 ? "md:col-span-2 lg:col-span-1" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-[var(--jet-primary)] text-white flex items-center justify-center font-bold text-sm mb-5">
                  {i + 1}
                </div>
                <h3 className="text-xl font-bold text-[var(--jet-text)] mb-1">
                  {value.title}
                </h3>
                <p className="text-sm font-medium text-[var(--jet-primary)] mb-3">
                  {value.subtitle}
                </p>
                <p className="text-[var(--jet-text-muted)] leading-relaxed">
                  {value.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Campus Photos */}
      <section className="py-20 lg:py-28">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-wider text-[var(--jet-primary)] mb-4">
              Our Campus
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--jet-text)]">
              9.5 acres in Granada Hills
            </h2>
            <p className="mt-4 text-lg text-[var(--jet-text-muted)] max-w-[540px] mx-auto">
              Classrooms, trade workshops, fitness center, pool, music studio,
              dining hall, and more.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                src: "https://www.jetsschool.org/wp-content/uploads/2019/03/jip1-2.png",
                alt: "Fitness center",
              },
              {
                src: "https://www.jetsschool.org/wp-content/uploads/2019/03/jip2-1.png",
                alt: "Pool",
              },
              {
                src: "https://www.jetsschool.org/wp-content/uploads/2019/03/jip3.png",
                alt: "Computer room",
              },
              {
                src: "https://www.jetsschool.org/wp-content/uploads/2019/03/jip4.png",
                alt: "Kitchen and dining",
              },
              {
                src: "https://www.jetsschool.org/wp-content/uploads/2019/03/jip5.png",
                alt: "Music studio",
              },
              {
                src: "https://www.jetsschool.org/wp-content/uploads/2020/10/jets_new_campus3.jpg",
                alt: "Campus rendering",
              },
            ].map((photo) => (
              <div
                key={photo.alt}
                className="relative aspect-video overflow-hidden rounded-xl"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={640}
                  height={360}
                  className="object-cover w-full h-full"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Video */}
      <section className="py-20 lg:py-28 bg-[var(--jet-bg-subtle)]">
        <div className="max-w-[900px] mx-auto px-6 lg:px-10">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold uppercase tracking-wider text-[var(--jet-primary)] mb-4">
              Our Philosophy
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--jet-text)]">
              Hear it from the source
            </h2>
          </div>
          <div className="relative aspect-video rounded-2xl overflow-hidden">
            <iframe
              src="https://player.vimeo.com/video/309679742?h=&title=0&byline=0&portrait=0"
              className="absolute inset-0 w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              style={{ border: 0 }}
              title="JETS Philosophy"
            />
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
