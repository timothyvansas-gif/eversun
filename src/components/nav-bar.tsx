import Logo from "@/components/logo";

export default function NavBar() {
  return (
    <header className="w-full bg-surface-page hidden md:block">
      <div className="w-full h-16 lg:h-[105px] max-w-[1280px] mx-auto flex items-center px-6 lg:px-0">
        <Logo className="h-10 w-auto lg:h-[52px] text-black" />
      </div>
    </header>
  );
}
