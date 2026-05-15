import Image from "next/image";
import facebookIcon from "@/images/socials/social-facebook.svg";
import instagramIcon from "@/images/socials/social-instagram.svg";

export default function Footer() {
  return (
    <footer
      className="w-full bg-black py-6 sm:py-10"
      style={{ paddingLeft: "clamp(1.5rem, 4vw, 10rem)", paddingRight: "clamp(1.5rem, 4vw, 10rem)" }}
    >
      <div className="w-full max-w-[1280px] mx-auto flex items-center justify-between">
        <p className="text-sm font-medium">
          <span className="text-white">Ever Sun ©</span>
          <span style={{ color: "#888888" }}>
            &nbsp; – &nbsp;<span className="hidden sm:inline">Ontworpen en ontwikkeld door Timothy van Sas</span><span className="sm:hidden">Ontwikkeld door Timothy van Sas</span>
          </span>
        </p>

        <div className="hidden sm:flex items-center gap-2">
          <a
            href="https://www.facebook.com/eversun.assen/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Facebook"
          >
            <Image
              src={facebookIcon}
              alt="Facebook"
              width={24}
              height={24}
              className="brightness-0 invert"
            />
          </a>
          <a
            href="https://www.instagram.com/ever_sun_assen/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Instagram"
          >
            <Image
              src={instagramIcon}
              alt="Instagram"
              width={24}
              height={24}
              className="brightness-0 invert"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
