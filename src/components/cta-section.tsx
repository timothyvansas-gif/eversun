import Image from "next/image";
import logoBackground from "@/images/people/logo-background.webp";

export default function CtaSection() {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ backgroundColor: "#1F1F1E", minHeight: 200 }}
    >
      <Image
        src={logoBackground}
        alt=""
        className="absolute top-0 right-0 pointer-events-none select-none"
        style={{ objectFit: "none", objectPosition: "top right" }}
        aria-hidden
      />
    </section>
  );
}
