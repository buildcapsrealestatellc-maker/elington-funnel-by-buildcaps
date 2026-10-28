import { Concierge } from "@/components/concierge/Concierge";
import { MetroSign } from "@/components/film/MetroSign";
import {
  AiStudio,
  AmenitiesDetail,
  Architecture,
  Credits,
  Developer,
  FutureDetail,
  GoldenVisa,
  IntelligenceDetail,
  LaunchFilm,
  LiftSpotlight,
  LocationDetail,
  MarketDetail,
  OfficesDetail,
  Overview,
  Ownership,
  Questions,
  Register,
  SummitDetail,
} from "@/components/film/Panels";
import { Shot } from "@/components/film/Shot";
import { Viewfinder } from "@/components/film/Viewfinder";
import { Preloader } from "@/components/intro/Preloader";
import { LaunchPopup, LeadDialog } from "@/components/lead/LeadDialogs";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { FilmNav } from "@/components/nav/FilmNav";
import { DestinationKeypad, FloorTracker, LiftDoors } from "@/components/nav/LiftSystem";
import { MobileBar } from "@/components/nav/SiteHeader";
import { StructuredData } from "@/components/seo/StructuredData";
import { ToolsHost } from "@/components/tools/ToolsHost";
import { BrochureButton, LeadButton } from "@/components/ui/Buttons";
import { Pill } from "@/components/ui/Kit";
import { shots } from "@/lib/data/shots";
import { goldenVisa } from "@/lib/data/tower";

// The funnel plays as a film: full-screen shots with real camera moves,
// cut between organised white chapters, from street level to the crown.
export default function FunnelPage() {
  let z = 0;
  const next = () => ++z;
  return (
    <>
      <StructuredData />
      <SmoothScroll />
      <FloorTracker />
      <Preloader />
      <FilmNav />
      <Viewfinder />
      <main>
        <Shot def={shots.hero} z={next()} opening preload lead={<MetroSign />}>
          <Pill tone="rose">★ {goldenVisa.years}-year Golden Visa route</Pill>
          <BrochureButton source="hero" variant="rose">
            Get the brochure
          </BrochureButton>
          <LeadButton intent={{ source: "hero" }} variant="light" arrow={false}>
            Launch access
          </LeadButton>
        </Shot>
        <LaunchFilm z={next()} />
        <Overview z={next()} />
        <Shot def={shots.arrival} z={next()} />
        <Shot def={shots.lobby} z={next()} />
        <Shot def={shots.facade} z={next()} />
        <Architecture z={next()} />
        <Shot def={shots.location} z={next()} />
        <LocationDetail z={next()} />
        <Shot def={shots.market} z={next()} />
        <MarketDetail z={next()} />
        <Shot def={shots.amenities} z={next()} />
        <AmenitiesDetail z={next()} />
        <LiftSpotlight z={next()} />
        <Shot def={shots.technology} z={next()} />
        <IntelligenceDetail z={next()} />
        <OfficesDetail z={next()} />
        <Shot def={shots.summit} z={next()} />
        <SummitDetail z={next()} />
        <Shot def={shots.future} z={next()} />
        <FutureDetail z={next()} />
        <Ownership z={next()} />
        <GoldenVisa z={next()} />
        <AiStudio z={next()} />
        <Developer z={next()} />
        <Questions z={next()} />
        <Shot def={shots.finale} z={next()}>
          <LeadButton intent={{ source: "finale" }} variant="light">
            Register now
          </LeadButton>
        </Shot>
        <Register z={next()} />
      </main>
      <Credits z={next()} />
      <MobileBar />
      <Concierge />
      <DestinationKeypad />
      <LiftDoors />
      <ToolsHost />
      <LeadDialog />
      <LaunchPopup />
    </>
  );
}
