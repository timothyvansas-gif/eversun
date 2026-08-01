import type { StaticImageData } from "next/image";
import prestige1600 from "@/images/banken/Ergoline-Prestige-1600.webp";
import blueVision from "@/images/banken/Ergoline-Blue-Vision.webp";
import affinity600 from "@/images/banken/Ergoline-600-v2.webp";
import ergoline700 from "@/images/banken/Ergoline-770.webp";

export type Zonnebank = {
  image: StaticImageData;
  imageQuality?: number;
  mobileVideo: string;
  desktopVideo?: string;
  alt: string;
  title: string;
  badge?: string;
  tag?: string;
  description: string[];
  minuten: string;
  prijs: string;
  whatsappUrl: string;
};

export const ZONNEBANKEN: Zonnebank[] = [
  {
    image: prestige1600,
    mobileVideo: "/videos/zonnebanken/prestige-1600-toggle-mobile.mp4?v=10",
    desktopVideo: "/videos/zonnebanken/prestige-1600-toggle-desktop.mp4?v=8",
    alt: "Ergoline Prestige 1600 zonnebad",
    title: "Ergoline Prestige 1600",
    badge: "2 banken",
    tag: "Populair",
    description: [
      "Rood Beauty Light biedt de ultieme combinatie van een diepe, egale bruining en intensieve, hoogwaardige huidverzorging.",
      "Stem de bank via 'Personal Sunstyle' af op jouw huid: kies intensive voor maximale kracht, medium voor natuurlijk of sensitive voor mild.",
    ],
    minuten: "20 min",
    prijs: "€ 18,00",
    whatsappUrl: "https://wa.me/31625306491?text=Hoi%20Ever%20Sun%2C%0Aik%20wil%20graag%20een%20zonsessie%20boeken%20voor%20de%20bank%20Ergoline%20Prestige%201600",
  },
  {
    image: ergoline700,
    mobileVideo: "/videos/zonnebanken/ergoline-770-toggle-mobile.mp4?v=10",
    desktopVideo: "/videos/zonnebanken/ergoline-770-toggle-desktop.mp4?v=8",
    alt: "Ergoline 770 Medium zonnebad",
    title: "Ergoline 770 medium",
    description: [
      "Een vertrouwde en geliefde krachtpatser die garant staat voor een consistent, onberispelijk en egaal bruiningsresultaat.",
      "Deze bank focust op pure performance. De ideale keuze voor de ervaren zonner die gaat voor een krachtige, betrouwbare sessie zonder poespas.",
    ],
    minuten: "20 min",
    prijs: "€ 14,00",
    whatsappUrl: "https://wa.me/31625306491?text=Hoi%20Ever%20Sun%2C%0Aik%20wil%20graag%20een%20zonsessie%20boeken%20voor%20de%20bank%20Ergoline%20770%20medium",
  },
  {
    image: blueVision,
    imageQuality: 90,
    mobileVideo: "/videos/zonnebanken/blue-vision-toggle-mobile.mp4?v=10",
    desktopVideo: "/videos/zonnebanken/blue-vision-toggle-desktop.mp4?v=8",
    alt: "Ergoline Blue Vision zonnebad",
    title: "Ergoline Blue Vision",
    badge: "2 banken",
    description: [
      "Activerend blauw licht stimuleert de zuurstofopname in je huid. Dit zorgt voor een direct zichtbaar en dieper bruiningsresultaat.",
      "Kies via het display jouw intensiteit: intensive voor de donkerste teint, medium voor opbouw of sensitive voor milde huidactivatie.",
    ],
    minuten: "20 min",
    prijs: "€ 19,50",
    whatsappUrl: "https://wa.me/31625306491?text=Hoi%20Ever%20Sun%2C%0Aik%20wil%20graag%20een%20zonsessie%20boeken%20voor%20de%20bank%20Ergoline%20Blue%20Vision",
  },
  {
    image: affinity600,
    imageQuality: 90,
    mobileVideo: "/videos/zonnebanken/ergoline-600-toggle-mobile.mp4?v=10",
    desktopVideo: "/videos/zonnebanken/ergoline-600-toggle-desktop.mp4?v=8",
    alt: "Ergoline Affinity 600 zonnebad",
    title: "Ergoline 600 light",
    description: [
      "Een toegankelijke en comfortabele klassieker die zorgt voor een betrouwbare, mooie en gelijkmatige bruining.",
      "Dankzij de ergonomische vormgeving en de verfrissende koeling geniet je van een ontspannen sessie met een natuurlijk resultaat als einddoel.",
    ],
    minuten: "20 min",
    prijs: "€ 12,00",
    whatsappUrl: "https://wa.me/31625306491?text=Hoi%20Ever%20Sun%2C%0Aik%20wil%20graag%20een%20zonsessie%20boeken%20voor%20de%20bank%20Ergoline%20600%20light",
  },
];
