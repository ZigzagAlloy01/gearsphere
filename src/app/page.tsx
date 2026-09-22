import { getLandingContent } from "../lib/supabase/landing";
import { createClient } from "../lib/supabase/server";

import type { Metadata } from "next";
import LandingMotion from "../components/landing/LandingMotion";
import Header from "../components/ui/header";
import Footer from "../components/ui/footer";
import Hero from "../components/landing/Hero";
import ValueProps from "../components/landing/ValueProps";
import Categories from "../components/landing/Categories";
import HowItWorks from "../components/landing/HowItWorks";
import FeatureEquipment from "../components/landing/FeatureEquipment";
import WhyGearSphere from "../components/landing/WhyGearSphere";
import Testimonials from "../components/landing/Testimonials";
import FinalCTA from "../components/landing/FinalCTA";
import { CatalogProvider } from "../components/landing/catalog";
import styles from "../components/landing/landing.module.css";

export const metadata: Metadata = {
  title: "GearSphere | The right equipment, when you need it",
  description:
    "Discover, rent, and list equipment through one simple marketplace. Explore gear for work, creative projects, events, and your next adventure.",
};

export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await getLandingContent();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const fullName = user?.user_metadata?.full_name;
  const userName = user
    ? (typeof fullName === "string" && fullName.trim()) || "My Account"
    : null;
  return (
    <div className={styles.page}>
      <LandingMotion>
        <Header userName={userName} />
        <Hero />
        <ValueProps />
        <CatalogProvider>
          <Categories categories={content.categories} />
          <HowItWorks />
          <FeatureEquipment
            equipment={content.equipment}
            categories={content.categories}
            demo={content.demo}
          />
        </CatalogProvider>
        <WhyGearSphere />
        <Testimonials testimonials={content.testimonials} />
        <FinalCTA />
        <Footer />
      </LandingMotion>
    </div>
  );
}
