import exlMerken from "@/images/exl-merken.webp";

export default function MerkenCard() {
  return (
    <div className="w-full h-[362px] bg-white rounded-lg flex flex-col overflow-hidden" style={{ paddingTop: 'clamp(24px, 4vw, 40px)', paddingLeft: 'clamp(24px, 4vw, 40px)', paddingRight: 'clamp(24px, 4vw, 40px)' }}>
      <h3 className="card-title text-zinc-900">Exclusieve merken</h3>
      <p className="card-body text-zinc-500 mt-1">Voor een kleur die langer blijft</p>
      <div className="relative flex-1 min-h-[160px] mt-4 overflow-hidden rounded-t-lg">
        <img 
          src={exlMerken.src} 
          alt="Exclusieve zonnebankproducten van het merk Black Velvet voor een langdurige kleur" 
          className="absolute inset-0 w-full h-full object-cover" 
        />
      </div>
    </div>
  );
}
