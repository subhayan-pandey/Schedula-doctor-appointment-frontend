import Hero from "@/features/landing/components/Hero";
import SpecialtyGrid from "@/features/landing/components/SpecialtyGrid";
import FeaturedDoctors from "@/features/landing/components/FeaturedDoctors";
import HowItWorks from "@/features/landing/components/HowItWorks";
import CTASection from "@/features/landing/components/CTASection";

export default function Home() {
  return (
    <main>
      <Hero />
      <SpecialtyGrid />
      <FeaturedDoctors />
      <HowItWorks />
      <CTASection />
    </main>
  );
}