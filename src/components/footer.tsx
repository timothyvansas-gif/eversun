import FooterCredit from "@/components/footer-credit";

export default function Footer() {
  return (
    <footer
      className="w-full bg-black py-6 sm:py-10"
      style={{ paddingLeft: "clamp(1.5rem, 4vw, 10rem)", paddingRight: "clamp(1.5rem, 4vw, 10rem)" }}
    >
      <div className="w-full max-w-[1280px] mx-auto flex items-center justify-between">
        <p className="text-sm font-medium">
          <span className="text-white">Ever Sun © {new Date().getFullYear()}</span>
          <span style={{ color: "#888888" }}>
            &nbsp; – &nbsp;<FooterCredit />
          </span>
        </p>
      </div>
    </footer>
  );
}
