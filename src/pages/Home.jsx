
import HeroSection from "@/components/home/Herosection";
import AnnouncementBar from "../components/layout/AnnouncementBar";
//import Navbar from "../components/layout/Navbar";
import CategorySection from "@/components/home/CategorySection";
 import FeaturedProducts from "@/components/home/FeaturedSection";
import CollectionSection from "@/components/home/CollectionSection";
//import Footer from "@/components/layout/Footer";
import FAQSection from "@/components/home/FAQsection";

export default function Home() {
  return (
      <main className="min-h-screen bg-[#F7F3EB]">
      <AnnouncementBar />
      {/* <Navbar /> */}
      <HeroSection />
      <CategorySection />
      
       <FeaturedProducts /> 

         <FAQSection />

      <CollectionSection />
      {/* <Footer />  */}
    </main>
  );
}
