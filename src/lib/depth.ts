// AI depth maps (Depth Anything V2, scripts/depth-maps.mjs). Brighter = nearer.
import clubhouseTerracesNight from "@/assets/depth/clubhouse-terraces-night.webp";
import dropOffCanopy from "@/assets/depth/drop-off-canopy.webp";
import lobbyReception from "@/assets/depth/lobby-reception.webp";
import roboticParking from "@/assets/depth/robotic-parking.webp";
import terraceViewNight from "@/assets/depth/terrace-view-night.webp";
import terracesNight from "@/assets/depth/terraces-night.webp";
import towerAerialNight from "@/assets/depth/tower-aerial-night.webp";
import towerDaySkyline from "@/assets/depth/tower-day-skyline.webp";
import towerDuskMetro from "@/assets/depth/tower-dusk-metro.webp";
import towerFogDawn from "@/assets/depth/tower-fog-dawn.webp";
import towersLookingUp from "@/assets/depth/towers-looking-up.webp";
import type { DepthKey } from "@/lib/data/shots";

export const depthMaps: Record<DepthKey, { src: string }> = {
  "tower-fog-dawn": towerFogDawn,
  "drop-off-canopy": dropOffCanopy,
  "lobby-reception": lobbyReception,
  "terraces-night": terracesNight,
  "tower-day-skyline": towerDaySkyline,
  "towers-looking-up": towersLookingUp,
  "clubhouse-terraces-night": clubhouseTerracesNight,
  "robotic-parking": roboticParking,
  "terrace-view-night": terraceViewNight,
  "tower-aerial-night": towerAerialNight,
  "tower-dusk-metro": towerDuskMetro,
};
