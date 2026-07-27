import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import OurTeamShowcase from "@/components/CommunityStoryCarousel";
import FacultyCoordinator from "@/components/FacultyCoordinator";
import Gallery from "@/components/Gallery";
import ReviewsMarquee from "@/components/ReviewsMarquee";
import ScrollTransitionSection from "@/components/ScrollTransitionSection";
import ServicesMarquee from "@/components/ServicesMarquee";

import AnimatedCloudBackground from "@/components/home/AnimatedCloudBackground";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main style={{ width: "100%", position: "relative" }}>
        <AnimatedCloudBackground />
        <Hero />
        <ScrollTransitionSection />
        <ServicesMarquee />
        <Gallery />
        <ReviewsMarquee />
        <OurTeamShowcase
          id="developers"
          badge="DEVELOPERS"
          title="Meet the Developers"
          subtitle="The talented student developers, engineers, and creators building the AWS Cloud Club web platform at REC."
          filterType="developers"
        />
        <FacultyCoordinator />
        <OurTeamShowcase id="team-bottom" />
      </main>
      <Footer />
    </>
  );
}
