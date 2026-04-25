import imageBig from "@/images/image-big.webp";
import imageRight from "@/images/image-right.webp";
import moreIcon from "@/images/more-icon.svg";

export default function PhotoCard() {
  return (
    <div className="w-full lg:w-bento-primary h-[362px] lg:h-[431px] bg-white rounded-lg p-6 lg:p-10 flex flex-col justify-between lg:shrink-0">
      <div className="grid grid-cols-2 grid-rows-[134px_1fr] md:flex lg:flex gap-[1px] lg:gap-[2px] mb-4 h-[220px] lg:h-[270px] rounded overflow-hidden">
        <div className="relative col-span-2 w-full h-full md:flex-[536] lg:flex-[536]">
          <img 
            src={imageBig.src} 
            alt="Sfeervol interieur van Ever Sun zonnestudio met houten tafel en witte stoelen" 
            className="absolute inset-0 w-full h-full object-cover" 
          />
        </div>
        <div className="relative w-full h-full md:block lg:block md:flex-[235] lg:flex-[235]">
          <img 
            src={imageRight.src} 
            alt="Interieur detail van de zonnestudio" 
            className="absolute inset-0 w-full h-full object-cover" 
          />
        </div>
        <div className="relative w-full h-full md:hidden">
          <img 
            src={imageRight.src} 
            alt="Interieur detail" 
            className="absolute inset-0 w-full h-full object-cover" 
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
        <button className="hidden lg:flex items-center gap-2 text-sm font-medium text-zinc-500 whitespace-nowrap ml-4">
          Meer foto&apos;s
          <img src={moreIcon.src} width={20} height={20} alt="Meer foto's bekijken" />
        </button>
      </div>
    </div>
  );
}
