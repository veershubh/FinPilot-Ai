import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { LiveInsightSection } from "@/components/landing/LiveInsightSection";
import { StatsBar } from "@/components/landing/StatsBar";
import { CTASection } from "@/components/landing/CTASection";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <FeaturesGrid />
      <LiveInsightSection />
      <StatsBar />
      <CTASection />
    </>
  );
}
