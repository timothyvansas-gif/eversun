import type { StaticImageData } from "next/image";
import imgDareToBeDark from "@/images/producten/eversun-Dare-to-be-dark.webp";
import imgWhiteBronzeCoconut from "@/images/producten/eversun-White-2-bronze-coconut.webp";
import imgBlackCrown from "@/images/producten/eversun-blackcrown.webp";
import imgBronzeButter from "@/images/producten/eversun-bronze-butter.webp";
import imgHimJet from "@/images/producten/eversun-him-jet.webp";
import imgHimSurf from "@/images/producten/eversun-him-surf.webp";
import imgSunHoney from "@/images/producten/eversun-sun-honey.webp";
import imgVault from "@/images/producten/eversun-vault.webp";
import imgCocoCreamsicle from "@/images/producten/eversun-coco-creamsicle.webp";
import imgBarefootBeachwood from "@/images/producten/eversun-barefoot-beachwood.webp";
import imgEnchantedEmerald from "@/images/producten/eversun-enchanted-emerald.webp";

/**
 * The shelf, in the order the carousel shows it.
 *
 * It lives here rather than inside the carousel because a second screen needs
 * it now: the huidtest advises one of these by `slug` and has to show its photo
 * and its sachet price. Two copies of a price list is one copy too many — the
 * card and the advice have to agree, and the only way to guarantee that is to
 * read from the same array.
 *
 * `slug` is that shared handle, and it is what the huidtest's rules are written
 * against; `id` stays what it was, the React key the carousel already used.
 */
export type Product = {
  id: number;
  slug: ProductSlug;
  name: string;
  description: string;
  hoverDescription: string;
  image: StaticImageData;
  imageNudgeY?: string;
  labels: string[];
  sachetPrice?: string;
  containerLabel: string;
  containerPrice: string;
  /** Geschat aantal sessies uit een volle fles of tube, met de prijs die dat per
   *  sessie oplevert. Alleen voor de zonproducten; verzorging kent geen sessie. */
  sessions?: { count: number; pricePerSession: string };
};

export type ProductSlug =
  | "coco-creamsicle"
  | "enchanted-emerald"
  | "him-surf"
  | "bronze-butter"
  | "white-2-bronze"
  | "barefoot-beachwood"
  | "black-crown"
  | "dare-to-be-dark"
  | "him-jet"
  | "sun-honey"
  | "vault";

export const PRODUCTEN: Product[] = [
  {
    id: 9,
    slug: "coco-creamsicle",
    name: "Coco Creamsicle",
    description: "Romige moisturizer met sinaasappelolie die je huid zacht houdt tussen sessies door.",
    hoverDescription: "Bacuri- en monoiboter smelten in je huid, hyaluronzuur houdt het vocht vast. Maracujaolie en cafeïne-extract maken 'm fijn voor een huid die strak aanvoelt na het zonnen.",
    image: imgCocoCreamsicle,
    labels: ["Moisturizer", "Vitamine C"],
    containerLabel: "Fles",
    containerPrice: "24,99",
  },
  {
    id: 11,
    slug: "enchanted-emerald",
    name: "Enchanted Emerald",
    description: "Frambozenextract en cactuswater voor dagelijkse hydratatie en een frisse glow.",
    hoverDescription: "Vegan collageen en probiotica werken aan je huidbarrière, elektrolyten uit cactuswater hydrateren 24 uur. Zonder parabenen en sulfaten, dus ook fijn bij een gevoelige huid.",
    image: imgEnchantedEmerald,
    // Fles staat hoger in het frame dan de rest; omlaag zodat de voet op
    // dezelfde bodemlijn valt.
    imageNudgeY: "10px",
    labels: ["Dagverzorging", "Antioxidanten"],
    containerLabel: "Fles",
    containerPrice: "24,99",
  },
  {
    id: 6,
    slug: "him-surf",
    name: "H.I.M. Surf",
    description: "Beschermt je tatoeages en trekt snel in. Versterkt je kleur zonder bronzer.",
    hoverDescription: "Kokoswater en duindoornbes vullen je huid met elektrolyten, kleurcorrectors houden rode tinten weg. Lichte formule die niet vet aanvoelt en de geur van het zonnen neutraliseert.",
    image: imgHimSurf,
    // Tube is lager gekadreerd dan de rest; omhoog naar dezelfde bodemlijn.
    imageNudgeY: "-10px",
    labels: ["Voor hem", "Beschermt tattoos"],
    sachetPrice: "4,99",
    containerLabel: "Tube",
    sessions: { count: 13, pricePerSession: "2,30" },
    containerPrice: "29,99",
  },
  {
    id: 4,
    slug: "bronze-butter",
    name: "Bronze Butter",
    description: "Zes boters en vegan collageen. Je huid blijft zacht, de kleur komt van jezelf.",
    hoverDescription: "Monoi, cupuaçu, mango, cacao, shea en wortel: een luchtige boter voor wie snel een droge, trekkende huid heeft. Matrixyl en copperpeptiden helpen je huid stevig te houden.",
    image: imgBronzeButter,
    labels: ["Zonder bronzer", "Hydraterend"],
    sachetPrice: "4,99",
    containerLabel: "Fles",
    sessions: { count: 16, pricePerSession: "2,80" },
    containerPrice: "44,99",
  },
  {
    id: 2,
    slug: "white-2-bronze",
    name: "White 2 Bronze Coconut",
    description: "Directe bronzer op kokoswater. Anti oranje technologie houdt de kleur natuurlijk.",
    hoverDescription: "Blue Tansy houdt oranje tinten weg, kokosolie en cactuswater verzachten ondertussen. Je ziet meteen kleur en de DHA werkt de uren erna verder door.",
    image: imgWhiteBronzeCoconut,
    labels: ["Directe kleur", "Anti oranje"],
    sachetPrice: "4,99",
    containerLabel: "Fles",
    sessions: { count: 16, pricePerSession: "3,10" },
    containerPrice: "49,99",
  },
  {
    id: 10,
    slug: "barefoot-beachwood",
    name: "Barefoot Beachwood",
    description: "Aftersun met cacayolie en kokosmelk. Kalmeert je huid na het zonnen.",
    hoverDescription: "Wilgenbast en komkommer halen de warmte uit je huid, aloë en avocado versterken de barrière. Trekt snel in en houdt je kleur een dag lang op z'n plek.",
    image: imgBarefootBeachwood,
    labels: ["Aftersun", "Hele dag hydratatie"],
    containerLabel: "Fles",
    containerPrice: "24,99",
  },
  {
    id: 3,
    slug: "black-crown",
    name: "Black Crown",
    description: "Zware bronzer met DHA. Direct resultaat dat de dagen erna nog dieper wordt.",
    hoverDescription: "Naast de bronzers zitten er verstevigende peptiden in en stoffen die je eigen pigmentaanmaak op gang helpen. De kleur zet door tot uren na je sessie.",
    image: imgBlackCrown,
    // Slanke, hoge fles: op de gedeelde bodemlijn oogt hij hoger in de kaart
    // dan de bredere flacons ernaast. Iets omlaag om dat te compenseren.
    imageNudgeY: "10px",
    labels: ["Voor gevorderden", "Zeer donker"],
    sachetPrice: "8,50",
    containerLabel: "Fles",
    sessions: { count: 14, pricePerSession: "6,10" },
    containerPrice: "84,99",
  },
  {
    id: 1,
    slug: "dare-to-be-dark",
    name: "Dare to be Dark",
    description: "Milde formule met komkommer en groene klei. Fijn als je huid snel reageert.",
    hoverDescription: "Geen bronzer, geen parfum, geen olie: alleen activatoren die je eigen kleur aanzetten. Groene thee en kleurcorrectors halen rode ondertonen eruit.",
    image: imgDareToBeDark,
    labels: ["Gevoelige huid", "Parfumvrij"],
    sachetPrice: "4,99",
    containerLabel: "Fles",
    sessions: { count: 16, pricePerSession: "1,85" },
    containerPrice: "29,99",
  },
  {
    id: 5,
    slug: "him-jet",
    name: "H.I.M. Jet",
    description: "Truffelextract en zwarte kombucha. Diep resultaat vanaf de eerste sessie.",
    hoverDescription: "Drievoudige bronzer met een auto-darkening complex, terwijl de AHA's uit kombucha je huid verfijnen. Trekt niet vet weg en ruikt naar amber en sandelhout.",
    image: imgHimJet,
    // Korte tube die hoog in het frame is gekadreerd; iets omlaag om aan te
    // sluiten bij de flessen ernaast.
    imageNudgeY: "10px",
    labels: ["Voor hem", "Diepe bronzer"],
    sachetPrice: "5,49",
    containerLabel: "Tube",
    sessions: { count: 13, pricePerSession: "2,70" },
    containerPrice: "34,99",
  },
  {
    id: 7,
    slug: "sun-honey",
    name: "Sun Honey",
    description: "Honing en agave binden vocht, ceramiden herstellen je huidbarrière.",
    hoverDescription: "Niacinamide en peptiden maken je huid ontvankelijker, fijn als je kleur al een tijdje stilstaat. Diamantpoeder zorgt voor die lichtreflecterende glans.",
    image: imgSunHoney,
    labels: ["Zonder bronzer", "Gouden glans"],
    sachetPrice: "8,49",
    containerLabel: "Fles",
    sessions: { count: 16, pricePerSession: "4,35" },
    containerPrice: "69,99",
  },
  {
    id: 8,
    slug: "vault",
    name: "Vault",
    description: "Ingekapselde DHA komt langzaam vrij, zo blijft je kleur dagen egaal.",
    hoverDescription: "Color lock-agenten zetten je kleur vast als een fixeerspray, de airbrush-blend maakt de overgangen egaal. Vegan collageen en copperpeptiden verzorgen je huid ondertussen.",
    image: imgVault,
    // Brede, gedrongen fles: op de gedeelde bodemlijn oogt hij hoger in de
    // kaart dan de slanke flacons ernaast. Iets omlaag om dat te compenseren.
    imageNudgeY: "10px",
    labels: ["Kleurbehoud", "Anti oranje"],
    sachetPrice: "12,99",
    containerLabel: "Fles",
    sessions: { count: 26, pricePerSession: "5,10" },
    containerPrice: "134,99",
  },
];
