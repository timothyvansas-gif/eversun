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
      "Het rode Beauty Light stimuleert de doorbloeding van je huid, zodat je kleur dieper wordt en je huid verzorgd blijft.",
      "Met Personal Sunstyle stel je de intensiteit zelf in: sensitive als je huid rustig wil beginnen, medium of intensive voor meer kracht.",
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
      "Het Dynamic Power systeem houdt de intensiteit je hele sessie constant, zo wordt je kleur overal even egaal opgebouwd.",
      "48 lampen en verder geen extra's. Fijn als je al weet hoe je huid reageert en gewoon een stevige, betrouwbare sessie wil.",
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
      "Het blauwe licht activeert de pigmentcellen in je huid al voor het zonnen.\nJe kleur komt daardoor sneller en dieper op gang.",
      "120 blauwe LEDs doen dat werk. Kies op het display sensitive, medium of intensive, net wat je huid vandaag aankan.",
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
      "De rustigste bank van de vier. Fijn als je net begint of je huid liever langzaam laat wennen aan de zon.",
      "Verstelbare ligvlakken en armsteunen, plus ventilatie die de temperatuur aangenaam houdt. Je stapt er ontspannen weer uit.",
    ],
    minuten: "20 min",
    prijs: "€ 12,00",
    whatsappUrl: "https://wa.me/31625306491?text=Hoi%20Ever%20Sun%2C%0Aik%20wil%20graag%20een%20zonsessie%20boeken%20voor%20de%20bank%20Ergoline%20600%20light",
  },
];
