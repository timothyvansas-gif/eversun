import Image from "next/image";
import heroImage from "@/images/hero-backgournd.webp";

export default function HeroSection() {
  return (
    <section className="relative w-full h-[85vh] min-[1538px]:h-[750px] overflow-hidden max-w-[1538px] mx-auto rounded-[8px]">
      <Image
        src={heroImage}
        alt="EverSun"
        fill
        priority
        className="object-cover"
      />
    </section>
  );
}
