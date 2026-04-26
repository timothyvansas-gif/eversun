import Bento from "@/components/bento";
import HeroSection from "@/components/hero-section";
import NavBar from "@/components/nav-bar";

export default function Home() {
  return (
    <main className="min-h-screen bg-surface-page flex flex-col items-center">
      <NavBar />
      <div className="w-full px-0 md:px-4 min-[1538px]:px-0">
        <HeroSection />
      </div>
      <div className="w-full flex flex-col items-center px-[24px] md:px-10 lg:px-0">
        <Bento />
      </div>
    </main>
  );
}
