import Image from "next/image";
import logo from "@/images/logo-eversun.svg";

export default function NavBar() {
  return (
    <header className="w-full bg-surface-page">
      <div className="w-full h-16 lg:h-[105px] max-w-[1280px] mx-auto flex items-center px-6 lg:px-0">
        <Image
          src={logo}
          alt="EverSun"
          width={180}
          height={52}
          priority
          className="h-10 w-auto lg:h-[52px]"
        />
      </div>
    </header>
  );
}
