"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type Row = { time: string; activity: string; emphasis?: boolean };

const weekday: Row[] = [
  { time: "7:30 AM", activity: "Wake-up — students are responsible for getting up on their own" },
  { time: "8:00 AM", activity: "Leave for JETS, coffee" },
  { time: "8:30 AM", activity: "Chassidus — Rabbi Ephy" },
  { time: "9:15 AM", activity: "Break" },
  { time: "9:30 AM", activity: "Shachris — Morning Ladder" },
  { time: "10:30 AM", activity: "Breakfast" },
  { time: "11:00 – 11:55 AM", activity: "Niglah — Beis Midrash" },
  { time: "12:00 – 12:50 PM", activity: "Professional Studies — Period 1" },
  { time: "1:00 – 1:50 PM", activity: "Professional Studies — Period 2" },
  { time: "2:00 – 3:00 PM", activity: "Lunch" },
  { time: "3:00 – 3:50 PM", activity: "Professional Studies — Period 3" },
  { time: "4:00 – 4:50 PM", activity: "Professional Studies — Period 4" },
  { time: "5:00 – 5:15 PM", activity: "Mincha" },
  { time: "5:15 – 6:30 PM", activity: "Special program / elective / selective / outings" },
  { time: "6:30 – 7:15 PM", activity: "Dinner (Sun / Mon / Tue / Thu)" },
  { time: "6:30 – 9:00 PM", activity: "Wednesday Night Shift — dinner off campus", emphasis: true },
  { time: "7:30 – 8:30 PM", activity: "Night Seder — by Madrichim (see weekly rotation)" },
  { time: "8:30 PM", activity: "Maariv" },
  { time: "9:00 PM", activity: "Return to dorm" },
  { time: "11:00 PM", activity: "Lights out" },
];

const friday: Row[] = [
  { time: "9:00 AM", activity: "Wake-up" },
  { time: "9:30 AM", activity: "Leave for JETS, coffee" },
  { time: "10:00 AM", activity: "Shachris" },
  { time: "10:40 AM", activity: "Breakfast" },
  { time: "11:10 AM – 12:10 PM", activity: "Weekly Reflection — Chassidus, Niglah, personal project" },
  { time: "12:30 PM", activity: "Mivtsoim or chesed project (see weekly schedule)" },
  { time: "1:30 PM", activity: "Lunch available" },
  { time: "15 min before candle lighting", activity: "Hand in phones and laptops to Madrichim, leave for JETS campus", emphasis: true },
  { time: "Candle lighting", activity: "Mincha — Dvar Torah — Kabbollas Shabbos" },
  { time: "~1 hr after candles", activity: "Seudas Shabbos" },
  { time: "9:00 PM", activity: "Return to dorm" },
  { time: "11:00 PM", activity: "Lights out" },
];

const shabbos: Row[] = [
  { time: "8:00 AM", activity: "Wake-up" },
  { time: "8:30 AM", activity: "Leave for JETS, coffee and cake" },
  { time: "9:00 AM", activity: "Tefilloh" },
  { time: "12:00 PM", activity: "Kiddush" },
  { time: "12:30 PM", activity: "Seudas Shabbos" },
  { time: "2:30 PM", activity: "Menuchas Shabbos on campus — snacks" },
  { time: "4:30 PM", activity: "Refreshments and games" },
  { time: "5:30 PM", activity: "Shiur time" },
  { time: "6:15 PM", activity: "Mincha" },
  { time: "6:45 PM", activity: "Seudah Shelishis" },
  { time: "Tzeis", activity: "Maariv and Havdalah" },
  { time: "8:30 PM", activity: "Melave Malka" },
  { time: "9:00 PM", activity: "Return to dorm" },
  { time: "11:00 PM", activity: "Lights out" },
];

const sunday: Row[] = [
  { time: "8:00 AM", activity: "Wake-up" },
  { time: "8:30 AM", activity: "Leave for JETS, coffee" },
  { time: "9:00 AM", activity: "Chassidus — Rabbi Ephy" },
  { time: "9:45 AM", activity: "Break" },
  { time: "10:00 AM", activity: "Shachris — Morning Ladder" },
  { time: "10:45 AM", activity: "Breakfast" },
  { time: "11:15 AM", activity: "Niglah — Beis Midrash" },
  { time: "12:00 PM", activity: "Lunch and prepare for outing" },
  { time: "12:30 PM", activity: "Weekly outing, hike, or trip — Mincha upon return or on trip", emphasis: true },
  { time: "6:30 PM", activity: "Dinner" },
  { time: "7:15 PM", activity: "Night Seder" },
  { time: "8:00 PM", activity: "Maariv" },
  { time: "8:15 PM", activity: "Back to dorm" },
  { time: "11:00 PM", activity: "Lights out" },
];

function ScheduleTable({ rows }: { rows: Row[] }) {
  return (
    <div className="rounded-lg border overflow-hidden">
      <table className="w-full text-sm">
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={`${row.time}-${idx}`}
              className={`border-b last:border-b-0 ${
                row.emphasis ? "bg-amber-50/60 dark:bg-amber-900/10" : ""
              }`}
            >
              <td className="py-2.5 px-4 w-[180px] sm:w-[220px] font-medium text-muted-foreground tabular-nums align-top">
                {row.time}
              </td>
              <td className="py-2.5 px-4 align-top">{row.activity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DailyScheduleTabs() {
  return (
    <Tabs defaultValue="weekday" className="space-y-4">
      <TabsList className="w-full sm:w-auto">
        <TabsTrigger value="weekday">Mon – Thu</TabsTrigger>
        <TabsTrigger value="friday">Friday</TabsTrigger>
        <TabsTrigger value="shabbos">Shabbos</TabsTrigger>
        <TabsTrigger value="sunday">Sunday</TabsTrigger>
      </TabsList>
      <TabsContent value="weekday">
        <ScheduleTable rows={weekday} />
      </TabsContent>
      <TabsContent value="friday">
        <ScheduleTable rows={friday} />
        <p className="text-xs text-muted-foreground mt-3">
          Friday afternoon follows the posted weekly Shabbos schedule — candle
          lighting time changes weekly.
        </p>
      </TabsContent>
      <TabsContent value="shabbos">
        <ScheduleTable rows={shabbos} />
      </TabsContent>
      <TabsContent value="sunday">
        <ScheduleTable rows={sunday} />
      </TabsContent>
    </Tabs>
  );
}
