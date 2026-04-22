// Zoom Server-to-Server OAuth integration.
// Requires these env vars to be set; if any are missing we return a null meeting
// so the scheduler still works end-to-end (without a Zoom link) until creds land.
//   ZOOM_ACCOUNT_ID
//   ZOOM_CLIENT_ID
//   ZOOM_CLIENT_SECRET
//   ZOOM_HOST_EMAIL   (the principal's Zoom-licensed email who hosts interviews)

interface ZoomMeeting {
  id: string;
  joinUrl: string;
  startUrl: string;
  passcode?: string;
}

async function getAccessToken(): Promise<string | null> {
  const accountId = process.env.ZOOM_ACCOUNT_ID;
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;
  if (!accountId || !clientId || !clientSecret) return null;

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );
  if (!res.ok) {
    console.error("Zoom auth failed", res.status, await res.text());
    return null;
  }
  const data = await res.json();
  return data.access_token as string;
}

export async function createZoomInterview(params: {
  topic: string;
  startIso: string;
  durationMinutes: number;
  agenda?: string;
}): Promise<ZoomMeeting | null> {
  const token = await getAccessToken();
  const host = process.env.ZOOM_HOST_EMAIL;
  if (!token || !host) {
    // Not configured yet — scheduler will save the booking without a Zoom link.
    console.warn("Zoom not configured — interview booked without Zoom meeting");
    return null;
  }

  const res = await fetch(
    `https://api.zoom.us/v2/users/${encodeURIComponent(host)}/meetings`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic: params.topic,
        type: 2, // scheduled meeting
        start_time: params.startIso,
        duration: params.durationMinutes,
        timezone: "America/Los_Angeles",
        agenda: params.agenda,
        settings: {
          join_before_host: false,
          waiting_room: true,
          participant_video: true,
          host_video: true,
          mute_upon_entry: false,
        },
      }),
    },
  );

  if (!res.ok) {
    console.error("Zoom create meeting failed", res.status, await res.text());
    return null;
  }

  const data = await res.json();
  return {
    id: String(data.id),
    joinUrl: data.join_url,
    startUrl: data.start_url,
    passcode: data.password,
  };
}
