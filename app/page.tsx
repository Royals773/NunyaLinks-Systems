import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProblemSection from "@/components/ProblemSection";
import WhatWeDo from "@/components/WhatWeDo";
import RoiSection from "@/components/RoiSection";
import WhatWeBuild from "@/components/WhatWeBuild";
import WhoWeWorkWith from "@/components/WhoWeWorkWith";
import WhyUs from "@/components/WhyUs";
import HowItWorks from "@/components/HowItWorks";
import Packages from "@/components/Packages";
import Footer from "@/components/Footer";

// Below the fold and the most interactive/stateful component on the page —
// code-split it out of the initial hydration bundle. Still server-rendered
// (ssr defaults to true), so there's no loading flash or SEO cost.
const AuditForm = dynamic(() => import("@/components/AuditForm"));

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <ProblemSection />
        <WhatWeDo />
        <RoiSection />
        <WhatWeBuild />
        <WhoWeWorkWith />
        <WhyUs />
        <HowItWorks />
        <Packages />
        <AuditForm />
      </main>
      <Footer />
    </>
  );
}
