import { getLiveScores, getTeams } from "@/lib/data";
import { getGalleryImages } from "@/actions/gallery";
import { HomeRealtime } from "@/components/home-realtime";

async function getHomeData() {
  const [teams, live, galleryImages] = await Promise.all([
    getTeams(),
    getLiveScores(),
    getGalleryImages(5), // Limit to 5 latest images
  ]);

  const scoreMap = new Map(live.map((item) => [item.team_id, item.total_points]));
  const sorted = [...teams].sort(
    (a, b) =>
      (scoreMap.get(b.id) ?? b.total_points) -
      (scoreMap.get(a.id) ?? a.total_points),
  );

  return { teams: sorted, live: scoreMap, galleryImages };
}

export const metadata = {
  title: "Hifz Fest | Home",
  description: "Welcome to Hifz Fest. Explore live scores, results, and participant performances.",
};

export default async function HomePage() {
  const { teams, live, galleryImages } = await getHomeData();

  return <HomeRealtime teams={teams} liveScores={live} galleryImages={galleryImages} />;
}
