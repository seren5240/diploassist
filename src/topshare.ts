const SUPABASE_API_URL = "https://bnyhrwwoycrqyusnmpuy.supabase.co";
const SUPABASE_PUBLIC_API_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJueWhyd3dveWNycXl1c25tcHV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTkwNzkwNjAsImV4cCI6MTk3NDY1NTA2MH0.kT5T8-HmkfHg75a-DDJ18baizzn_Qbuva0MHBs2NO98";

// ignore ts because UMD module global supabase not recognized by compiler
// @ts-ignore
const sb = supabase.createClient(SUPABASE_API_URL, SUPABASE_PUBLIC_API_KEY);

async function sendDatabaseRequestForTopshare(player: string): Promise<number> {
  const { data, error } = await sb.rpc("get_topshare", { player });

  return data;
}

async function getTopshareForPlayer(player: string): Promise<number> {
  const playerName = player.split("#")[0].trim();
  const topshare: number = await sendDatabaseRequestForTopshare(playerName);
  return topshare ? parseInt((topshare * 100).toPrecision(2)) : 0;
}

function getPlayers(): RegExpMatchArray[] {
  const info = d3.select("#info");

  if (info.empty()) {
    return [];
  }

  return Array.from(
    info.text().matchAll(/\S* \S*#([0-9]{4}|None)\s+\—\s+([a-zA-Z])*/gi)
  );
}

async function loadTopshares(players: RegExpMatchArray[]): Promise<void> {
  let index = 0;

  const topshares: number[] = await Promise.all(
    players.map(async (player) => await getTopshareForPlayer(player[0]))
  );

  d3.select("#info")
    .select("ul")
    .selectAll("li")
    .append("text")
    .text(function (d) {
      const topshareText = `:  Topshare = ${topshares[index]}%`;
      index += 1;
      return topshareText;
    });
}
