import Image from "next/image";
import exlMerken from "@/images/exl-merken-update.webp";

export default function MerkenCard() {
  return (
    <div className="w-full h-[362px] rounded-lg flex flex-col overflow-hidden" style={{ backgroundColor: '#DCD5C4', paddingTop: 'clamp(24px, 4vw, 40px)', paddingLeft: 'clamp(24px, 4vw, 40px)', paddingRight: 'clamp(24px, 4vw, 40px)' }}>
      <h3 className="card-title text-[#000000]">Exclusieve merken</h3>
      <p className="card-body text-[#000000]/70 mt-1">Voor een kleur die langer blijft</p>
      <div className="relative flex-1 min-h-[160px] mt-4 overflow-hidden rounded-t-lg">
        <Image
          src={exlMerken}
          alt="Exclusieve zonnebankproducten van het merk Black Velvet voor een langdurige kleur"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 411px"
        />
      </div>
    </div>
  );
}
