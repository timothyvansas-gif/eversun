import Image from "next/image";
import imageBig from "@/images/image-big.webp";
import imageRight from "@/images/image-right.webp";
import moreIcon from "@/images/more-icon.svg";

export default function PhotoCard() {
  return (
    <div className="w-full h-[362px] xl:h-[431px] bg-white rounded-lg flex flex-col justify-between" style={{ padding: 'clamp(24px, 4vw, 40px)' }}>
      <div className="grid grid-cols-2 grid-rows-[134px_1fr] md:flex xl:flex gap-[1px] xl:gap-[2px] mb-4 h-[220px] xl:h-[270px] rounded overflow-hidden">
        <div className="relative col-span-2 w-full h-full md:flex-[536] xl:flex-[536]">
          <Image
            src={imageBig}
            alt="Sfeervol interieur van Ever Sun zonnestudio met houten tafel en witte stoelen"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 536px"
          />
        </div>
        <div className="relative w-full h-full md:block xl:block md:flex-[235] xl:flex-[235]">
          <Image
            src={imageRight}
            alt="Interieur detail van de zonnestudio"
            fill
            className="object-cover"
            sizes="235px"
          />
        </div>
        <div className="relative w-full h-full md:hidden">
          <Image
            src={imageRight}
            alt="Interieur detail"
            fill
            className="object-cover"
            sizes="50vw"
          />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <h3 className="card-title text-zinc-900">Een warm welkom</h3>
          <p className="card-body text-zinc-500 mt-1">
            De koffie en thee staan klaar: jouw moment van rust begint hier
          </p>
        </div>
        <button className="hidden xl:flex items-center gap-2 text-sm font-medium text-zinc-500 whitespace-nowrap ml-4">
          Meer foto&apos;s
          <Image src={moreIcon} width={20} height={20} alt="Meer foto's bekijken" />
        </button>
      </div>
    </div>
  );
}
