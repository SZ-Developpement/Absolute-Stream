import { NavBar } from "@/components/layout/NavBar";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-background text-foreground font-sans ">
      <NavBar />
      <h1 className="text-4xl font-black">Absolute Stream</h1>
    </div>
  );
}
