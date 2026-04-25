import Image from "next/image";
import exlMerken from "@/images/exl-merken.webp";

export default function MerkenCard() {
  return (
    <div className="w-full lg:w-[411px] h-[362px] bg-white rounded-lg pt-6 px-6 lg:pt-10 lg:px-10 flex flex-col lg:shrink-0 overflow-hidden">
      <h3 className="card-title text-zinc-900">Exclusieve merken</h3>
      <p className="card-body text-zinc-500 mt-1">Voor een kleur die langer blijft</p>
      <div className="relative flex-1 mt-4 overflow-hidden rounded-t-lg">
        <Image src={exlMerken} alt="" fill className="object-cover" />
      </div>
    </div>
  );
}
