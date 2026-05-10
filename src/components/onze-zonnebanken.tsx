export default function OnzeZonnebanken() {
  return (
    <section className="w-full bg-white py-16 xl:py-24">
      <div
        className="w-full flex flex-col items-center"
        style={{ paddingLeft: "clamp(1.5rem, 4vw, 10rem)", paddingRight: "clamp(1.5rem, 4vw, 10rem)" }}
      >
        <div className="w-full max-w-[1280px] mx-auto">
          <div className="mb-5 xl:mb-10">
            <div className="flex flex-col xl:flex-row xl:justify-between xl:items-end gap-5 xl:gap-6">
              <div>
                <h2 className="text-[clamp(28px,3.75vw,48px)] font-medium leading-none tracking-[-0.01em] xl:tracking-[-0.015em] text-zinc-900 font-display">
                  Onze zonnebanken
                </h2>
                <h3 className="text-[clamp(28px,3.75vw,48px)] font-medium leading-none tracking-[-0.01em] xl:tracking-[-0.015em] text-zinc-400 font-display mt-1">
                  voor echt comfort
                </h3>
              </div>
              <p className="text-zinc-600 text-[15px] leading-[25px] max-w-[411px] tracking-[-0.01em] xl:mb-[2px]">
                Ervaar de wereldwijde standaard in zonlicht. Met Ergoline kies je voor slimme sensoren, verfijnd ligcomfort en een resultaat dat gezien mag worden.
              </p>
            </div>
          </div>
          <div className="flex flex-col xl:flex-row gap-6">
            <div className="flex-1 flex flex-col gap-6">
              <div className="min-h-[300px] xl:min-h-[400px] bg-zinc-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto mb-2 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-zinc-400 text-sm">Afbeelding</p>
                </div>
              </div>
              <div className="flex flex-col gap-[10px] xl:pr-14">
                <h3 className="text-zinc-900 text-[18px] font-semibold tracking-[-0.27px] font-sans">
                  Ergoline Prestige 1600
                </h3>
                <p className="text-zinc-600 text-[15px] leading-[25px] tracking-[-0.01em] font-sans">
                  Deze bank is de ideale keuze voor wie een diepe kleur wil combineren met intensieve huidverzorging: gebruik de Medium-stand voor een krachtige, egale bruining of de Light-stand voor een milde, gezonde glow.
                </p>
                <p className="text-zinc-600 text-[15px] leading-[25px] tracking-[-0.01em] font-sans">
                  Het is de perfecte match voor de zonner die waarde hecht aan een zijdezacht huidgevoel en een ontspannen ervaring.
                </p>
              </div>
            </div>
            <div className="xl:hidden h-px my-2" style={{ backgroundColor: "#f1f1f1" }} />
            <div className="flex-1 flex flex-col gap-6">
              <div className="min-h-[300px] xl:min-h-[400px] bg-zinc-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto mb-2 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-zinc-400 text-sm">Afbeelding</p>
                </div>
              </div>
              <div className="flex flex-col gap-[10px] xl:pr-14">
                <h3 className="text-zinc-900 text-[18px] font-semibold tracking-[-0.27px] font-sans">
                  Ergoline Blue Vision
                </h3>
                <p className="text-zinc-600 text-[15px] leading-[25px] tracking-[-0.01em] font-sans">
                  De Blue Vision is ontworpen voor de resultaatgerichte zonner die gaat voor maximale snelheid en efficiëntie, met een Medium-stand voor een directe, diepdonkere teint en een Light-stand voor een vitale en geleidelijke kleuropbouw.
                </p>
                <p className="text-zinc-600 text-[15px] leading-[25px] tracking-[-0.01em] font-sans">
                  Dankzij de activerende blauwlichttechnologie bereik je hiermee sneller je gewenste resultaat zonder extra belasting voor de huid.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
