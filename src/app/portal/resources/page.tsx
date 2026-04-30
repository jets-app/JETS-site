import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import {
  CalendarDays,
  Clock,
  Moon,
  Plane,
  Mail,
} from "lucide-react";
import { DailyScheduleTabs } from "./_components/daily-schedule-tabs";

type CalendarRow = {
  date: string;
  hebrew: string;
  event: string;
  highlight?: boolean;
};

type Zman = {
  title: string;
  range: string;
  rows: CalendarRow[];
  break?: { title: string; range: string };
};

const ZMANIM: Zman[] = [
  {
    title: "Orientation & Winter Zman",
    range: "Aug 24, 2026 – Jan 14, 2027",
    rows: [
      { date: "Aug 24", hebrew: "11 Elul", event: "Faculty orientation — schedule TBD" },
      { date: "Sep 1", hebrew: "19 Elul", event: "Orientation Zman — students arrive / night program", highlight: true },
      { date: "Sep 2", hebrew: "20 Elul", event: "Formal classes begin", highlight: true },
      { date: "Sep 12", hebrew: "1 Tishrei", event: "1st day of Rosh Hashanah" },
      { date: "Sep 13", hebrew: "2 Tishrei", event: "2nd day of Rosh Hashanah" },
      { date: "Sep 14", hebrew: "3 Tishrei", event: "Tzom Gedaliah — revised schedule" },
      { date: "Sep 16", hebrew: "5 Tishrei", event: "Last day of classes / final projects" },
      { date: "Sep 17", hebrew: "6 Tishrei", event: "Students leave after Shachris — dorms close" },
      { date: "Oct 11", hebrew: "30 Tishrei", event: "Winter Zman — students arrive / night program", highlight: true },
      { date: "Oct 12", hebrew: "1 Cheshvan", event: "Formal classes begin", highlight: true },
      { date: "Dec 4", hebrew: "24 Kislev", event: "Light first Chanukah light" },
      { date: "Dec 20", hebrew: "10 Teves", event: "Assarah BeTeves — revised schedule" },
      { date: "Jan 11", hebrew: "3 Shevat", event: "Final exams and projects week" },
      { date: "Jan 13", hebrew: "5 Shevat", event: "Last day of classes / final projects" },
      { date: "Jan 14", hebrew: "6 Shevat", event: "Students leave after Shachris — dorms close" },
    ],
    break: { title: "Winter Break", range: "January 14 – February 1" },
  },
  {
    title: "Spring Zman",
    range: "Feb 2 – Apr 8, 2027",
    rows: [
      { date: "Feb 2", hebrew: "25 Shevat", event: "Students return from winter break / night program", highlight: true },
      { date: "Feb 3", hebrew: "26 Shevat", event: "Formal classes begin", highlight: true },
      { date: "Mar 22", hebrew: "13 Adar", event: "Taanith Esther; Purim begins at night" },
      { date: "Mar 23", hebrew: "14 Adar", event: "Purim — special programs" },
      { date: "Mar 24", hebrew: "15 Adar", event: "Shushan Purim — late start, special program" },
      { date: "Apr 5", hebrew: "27 Adar Bet", event: "Final exams and projects week" },
      { date: "Apr 7", hebrew: "29 Adar Bet", event: "Last day of classes / final projects" },
      { date: "Apr 8", hebrew: "1 Nissan", event: "Students leave after Shachris — dorms close" },
    ],
    break: { title: "Pesach Break", range: "April 9 – May 1" },
  },
  {
    title: "Capstone Zman",
    range: "May 2 – June 3, 2027",
    rows: [
      { date: "May 2", hebrew: "25 Nissan", event: "Students return from Pesach break / night program", highlight: true },
      { date: "May 3", hebrew: "26 Nissan", event: "Formal classes begin", highlight: true },
      { date: "May 24", hebrew: "17 Iyar", event: "Lag B'Omer programs begin at night" },
      { date: "May 25", hebrew: "18 Iyar", event: "Lag B'Omer — special programs" },
      { date: "May 26", hebrew: "19 Iyar", event: "Final exams and projects begin" },
      { date: "May 30", hebrew: "23 Iyar", event: "End-of-year program / Graduation", highlight: true },
      { date: "May 31", hebrew: "24 Iyar", event: "End-of-year trip" },
      { date: "June 2", hebrew: "26 Iyar", event: "Last day of classes / final projects" },
      { date: "June 3", hebrew: "27 Iyar", event: "Students leave after Shachris — dorms close" },
    ],
  },
];

const NIGHT_SEDER = [
  { day: "Sunday", program: "Madrichim Shiur" },
  { day: "Monday", program: "Sichos In English" },
  { day: "Tuesday", program: "Madrichim Program" },
  { day: "Wednesday", program: "Night Shift — off campus" },
  { day: "Thursday", program: "Farbrengen" },
  { day: "Friday", program: "Oneg Shabbos" },
  { day: "Shabbos", program: "Menucha" },
];

export default async function PortalResourcesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role && session.user.role !== "PARENT") {
    redirect("/admin/dashboard");
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Resources
        </h1>
        <p className="text-muted-foreground">
          The school calendar, daily schedule, and travel info — all in one place.
        </p>
      </div>

      {/* ============ Calendar ============ */}
      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">School Calendar 5786 – 5787</h2>
            <p className="text-xs text-muted-foreground">2026 – 2027 academic year</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground italic">
          Calendar is subject to change — please check JETS updates for the latest
          information.
        </p>

        <div className="space-y-6">
          {ZMANIM.map((z) => (
            <div key={z.title} className="space-y-3">
              <div className="rounded-xl border bg-card overflow-hidden">
                <div className="px-5 py-4 border-b bg-muted/30">
                  <h3 className="font-semibold">{z.title}</h3>
                  <p className="text-xs text-muted-foreground">{z.range}</p>
                </div>
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase text-muted-foreground/80">
                    <tr className="border-b">
                      <th className="text-left font-medium py-2 px-5 w-[110px]">Date</th>
                      <th className="text-left font-medium py-2 px-3 w-[120px]">Hebrew</th>
                      <th className="text-left font-medium py-2 px-3">Event</th>
                    </tr>
                  </thead>
                  <tbody>
                    {z.rows.map((r) => (
                      <tr
                        key={`${z.title}-${r.date}`}
                        className={`border-b last:border-b-0 ${
                          r.highlight ? "bg-primary/5" : ""
                        }`}
                      >
                        <td className="py-2 px-5 font-medium tabular-nums">{r.date}</td>
                        <td className="py-2 px-3 text-muted-foreground tabular-nums">{r.hebrew}</td>
                        <td className={`py-2 px-3 ${r.highlight ? "font-medium" : ""}`}>
                          {r.event}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {z.break && (
                <div className="rounded-lg border border-dashed bg-muted/20 px-5 py-3 text-center">
                  <span className="text-sm font-medium">{z.break.title}</span>
                  <span className="text-sm text-muted-foreground"> · {z.break.range}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ============ Daily Schedule ============ */}
      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Seder Hayom — Daily Schedule</h2>
            <p className="text-xs text-muted-foreground">
              The default day-by-day schedule on campus.
            </p>
          </div>
        </div>
        <DailyScheduleTabs />
      </section>

      {/* ============ Night Seder ============ */}
      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Moon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Night Seder Rotation</h2>
            <p className="text-xs text-muted-foreground">
              The weekly evening program rotation.
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {NIGHT_SEDER.map((row) => (
                <tr key={row.day} className="border-b last:border-b-0">
                  <td className="py-3 px-5 font-medium w-[180px]">{row.day}</td>
                  <td className="py-3 px-3 text-muted-foreground">{row.program}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ============ Travel ============ */}
      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Plane className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Travel & Arrival</h2>
            <p className="text-xs text-muted-foreground">
              Tips for getting to and from JETS.
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-4 text-sm">
          <div>
            <h3 className="font-medium mb-1">Arrival times</h3>
            <p className="text-muted-foreground">
              Students may fly in to arrive after 11:00 AM on opening and
              orientation days.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-1">Departure times</h3>
            <p className="text-muted-foreground">
              Students may leave for the airport after 10:30 AM when leaving for
              breaks. If your flight departs earlier, please clear plans with the
              administration <em>before</em> booking.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-1">Airports</h3>
            <ul className="text-muted-foreground space-y-1.5 list-disc list-inside marker:text-muted-foreground/40">
              <li>
                <span className="font-medium text-foreground">Burbank Airport (BUR)</span> — closer to JETS
                and more convenient. Take an Uber directly to JETS.
              </li>
              <li>
                <span className="font-medium text-foreground">LAX</span> — take the
                Flyaway bus to the Van Nuys bus station, then Uber to JETS, or
                Uber directly from LAX.
              </li>
            </ul>
          </div>
          <div className="rounded-lg border bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 p-4 flex gap-3">
            <Mail className="h-4 w-4 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5" />
            <p className="text-amber-900 dark:text-amber-200">
              Please email your itinerary every time you arrive or leave JETS to{" "}
              <a
                href="mailto:info@jetsschool.org"
                className="font-medium underline underline-offset-2"
              >
                info@jetsschool.org
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
