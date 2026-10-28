// Static imports give next/image intrinsic sizes and automatic blur placeholders.
import architectureModel from "@/assets/media/architecture-model.webp";
import clubhouse from "@/assets/media/clubhouse.webp";
import clubhouseTerracesAerial from "@/assets/media/clubhouse-terraces-aerial.webp";
import clubhouseTerracesNight from "@/assets/media/clubhouse-terraces-night.webp";
import coworkingLounge from "@/assets/media/coworking-lounge.webp";
import coworkingSeaView from "@/assets/media/coworking-sea-view.webp";
import coworkingSpace from "@/assets/media/coworking-space.webp";
import droneTerraces from "@/assets/media/drone-terraces.webp";
import dropOffCanopy from "@/assets/media/drop-off-canopy.webp";
import elevationB from "@/assets/media/elevation-b.webp";
import fitnessStudio from "@/assets/media/fitness-studio.webp";
import gamesRoom from "@/assets/media/games-room.webp";
import lobbyReception from "@/assets/media/lobby-reception.webp";
import locationModel from "@/assets/media/location-model.webp";
import metroStation from "@/assets/media/metro-station.webp";
import officeEmptyBurjView from "@/assets/media/office-empty-burj-view.webp";
import officeInterior from "@/assets/media/office-interior.webp";
import pilatesStudio from "@/assets/media/pilates-studio.webp";
import planDuplexL54 from "@/assets/media/plan-duplex-l54.webp";
import planDuplexL55 from "@/assets/media/plan-duplex-l55.webp";
import planHigh1 from "@/assets/media/plan-high-1.webp";
import planHigh2 from "@/assets/media/plan-high-2.webp";
import planHigh3 from "@/assets/media/plan-high-3.webp";
import planHigh4 from "@/assets/media/plan-high-4.webp";
import planLow2 from "@/assets/media/plan-low-2.webp";
import planLow3 from "@/assets/media/plan-low-3.webp";
import planLow4 from "@/assets/media/plan-low-4.webp";
import planLow8 from "@/assets/media/plan-low-8.webp";
import planTriplexL56 from "@/assets/media/plan-triplex-l56.webp";
import planTriplexL58 from "@/assets/media/plan-triplex-l58.webp";
import restRecharge from "@/assets/media/rest-recharge.webp";
import roboticParking from "@/assets/media/robotic-parking.webp";
import smartAccess from "@/assets/media/smart-access.webp";
import spinningStudio from "@/assets/media/spinning-studio.webp";
import terraceViewNight from "@/assets/media/terrace-view-night.webp";
import terracesNight from "@/assets/media/terraces-night.webp";
import towerAerialNight from "@/assets/media/tower-aerial-night.webp";
import towerDaySkyline from "@/assets/media/tower-day-skyline.webp";
import towerDuskMetro from "@/assets/media/tower-dusk-metro.webp";
import towerDuskPortrait from "@/assets/media/tower-dusk-portrait.webp";
import towerFogDawn from "@/assets/media/tower-fog-dawn.webp";
import towersLookingUp from "@/assets/media/towers-looking-up.webp";
import vertiport from "@/assets/media/vertiport.webp";

export const media = {
  "architecture-model": architectureModel,
  clubhouse,
  "clubhouse-terraces-aerial": clubhouseTerracesAerial,
  "clubhouse-terraces-night": clubhouseTerracesNight,
  "coworking-lounge": coworkingLounge,
  "coworking-sea-view": coworkingSeaView,
  "coworking-space": coworkingSpace,
  "drone-terraces": droneTerraces,
  "drop-off-canopy": dropOffCanopy,
  "elevation-b": elevationB,
  "fitness-studio": fitnessStudio,
  "games-room": gamesRoom,
  "lobby-reception": lobbyReception,
  "location-model": locationModel,
  "metro-station": metroStation,
  "office-empty-burj-view": officeEmptyBurjView,
  "office-interior": officeInterior,
  "pilates-studio": pilatesStudio,
  "plan-duplex-l54": planDuplexL54,
  "plan-duplex-l55": planDuplexL55,
  "plan-high-1": planHigh1,
  "plan-high-2": planHigh2,
  "plan-high-3": planHigh3,
  "plan-high-4": planHigh4,
  "plan-low-2": planLow2,
  "plan-low-3": planLow3,
  "plan-low-4": planLow4,
  "plan-low-8": planLow8,
  "plan-triplex-l56": planTriplexL56,
  "plan-triplex-l58": planTriplexL58,
  "rest-recharge": restRecharge,
  "robotic-parking": roboticParking,
  "smart-access": smartAccess,
  "spinning-studio": spinningStudio,
  "terrace-view-night": terraceViewNight,
  "terraces-night": terracesNight,
  "tower-aerial-night": towerAerialNight,
  "tower-day-skyline": towerDaySkyline,
  "tower-dusk-metro": towerDuskMetro,
  "tower-dusk-portrait": towerDuskPortrait,
  "tower-fog-dawn": towerFogDawn,
  "towers-looking-up": towersLookingUp,
  vertiport,
} as const;

export type MediaKey = keyof typeof media;
