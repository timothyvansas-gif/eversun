import type { Metadata } from "next";
import HuidtestQuiz from "@/components/huidtest/huidtest-quiz";
import { decodeAnswers, SHARE_PARAM } from "@/lib/huidtest/share";
import { SOCIAL_IMAGE, TWITTER_IMAGE } from "@/lib/social-metadata";

/**
 * The quiz as a page, which is what a shared link needs — a result someone
 * pasted into a chat has to open somewhere. On the site itself the test lives
 * in a panel over the page instead; both run the same component.
 *
 * The answers are decoded here, on the server, so the client never has to read
 * the URL and the first paint is already the right screen.
 */

export const metadata: Metadata = {
  title: "Huidtest | Ever Sun",
  description:
    "Vijf korte vragen en je weet welke Ergoline zonnebank en welk product bij jouw huid passen. Duurt nog geen minuut.",
  alternates: { canonical: "/huidtest" },
  openGraph: {
    title: "Huidtest | Ever Sun",
    description:
      "Vijf korte vragen en je weet welke zonnebank en welk product bij jouw huid passen.",
    url: "/huidtest",
    siteName: "Ever Sun",
    locale: "nl_NL",
    type: "website",
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Huidtest | Ever Sun",
    description:
      "Vijf korte vragen en je weet welke zonnebank en welk product bij jouw huid passen.",
    images: [TWITTER_IMAGE],
  },
};

export default async function HuidtestPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = (await searchParams)[SHARE_PARAM];
  const shared = decodeAnswers(typeof raw === "string" ? raw : null);

  return (
    <main className="min-h-screen bg-surface-page px-6 py-12 sm:py-16">
      {/* Clipped, not hidden: the step waiting behind a swipe is parked a
          screen-width to the left, and it should be out of sight rather than
          somewhere the page can be scrolled to. */}
      <div className="mx-auto w-full max-w-[640px] overflow-x-clip">
        {/* The page needs a heading of its own: inside, every screen is an h2,
            because the quiz is a section of a page as often as it is the page. */}
        <h1 className="sr-only">Huidtest</h1>
        <HuidtestQuiz shared={shared} historyBacked />
      </div>
    </main>
  );
}
