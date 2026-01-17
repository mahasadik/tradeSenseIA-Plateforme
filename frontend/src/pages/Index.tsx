import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TradingSection from "@/components/TradingSection";
import NewsSection from "@/components/NewsSection";
import LeaderboardPreview from "@/components/LeaderboardPreview";
import CommunitySection from "@/components/CommunitySection";
import MasterclassSection from "@/components/MasterclassSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <TradingSection />
      <NewsSection />
      <LeaderboardPreview />
      <CommunitySection />
      <MasterclassSection />
      <CTASection />
      <Footer />
    </main>
  );
};

export default Index;
