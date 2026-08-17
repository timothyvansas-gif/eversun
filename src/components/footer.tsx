import FooterCredit from "@/components/footer-credit";
import FaqFooterLink from "@/components/faq-footer-link";

export default function Footer() {
  return (
    <footer
      className="w-full bg-white border-t border-line/20 py-6 sm:py-10"
      style={{ paddingLeft: "clamp(1.5rem, 4vw, 10rem)", paddingRight: "clamp(1.5rem, 4vw, 10rem)" }}
    >
      <div className="w-full max-w-[1280px] mx-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <p className="text-sm font-medium">
          <span className="text-zinc-500">Ever Sun © {new Date().getFullYear()}</span>
          <span className="text-muted">
            &nbsp; – &nbsp;<FooterCredit />
          </span>
        </p>
        <FaqFooterLink />
      </div>
    </footer>
  );
}
