// app/crafting/page.tsx
import Image from "next/image";
import Link from "next/link";
const root_dir = "/Crafting/Art Assets"; 
const sprites = {
  // ⬇️ update these if your filenames are different
  smallHexBlue: root_dir + "/UI/UiNode.png",
  smallHexYellow: root_dir + "/UI/UiNode.png",
  bigHexYellow: root_dir + "/UI/UiNode.png",
  crate: root_dir + "/Sprites/MetalPlanks.png",
  cornerL: root_dir + "/corner-L.png",
  cornerR: root_dir + "/corner-R.png",
  chestBadge: root_dir + "/Sprites/MetalChest.png",
};

export default function CraftingBannerPage() {
  return (
    <main className="min-h-[60vh] w-[70vh] bg-[#091d34] text-white flex items-center justify-center p-4">
      <section className="w-full max-w-[1200px] rounded-md overflow-hidden shadow-xl ring-1 ring-black/10">
        {/* whole banner */}
        <div className="grid grid-cols-12">
          {/* left panel (art) */}
          <div className="relative col-span-12 md:col-span-5 bg-[#1a202c] pt-8 pb-10 px-6">
            {/* corner accents */}
            <div className="absolute left-5 bottom-5 h-16 w-16 border-l-4 border-b-4 border-[#0ea5e9]/70 rounded-bl-sm" />
            <div className="absolute right-6 top-8 h-16 w-16 border-r-4 border-t-4 border-[#0ea5e9]/70 rounded-tr-sm" />

            {/* 3x3 cluster of small hexes */}
            <div className="grid grid-cols-3 gap-6">
              {[
                0, 1, 2,
                3, 4, 5,
                6, 7, 8,
              ].map((i) => (
                <div
                  key={i}
                  className="relative aspect-square"
                  title="resource"
                >
                  <Image
                    src={i === 4 ? sprites.smallHexYellow : sprites.smallHexBlue}
                    alt="hex"
                    fill
                    sizes="120px"
                    className="object-contain drop-shadow-[0_0_10px_rgba(14,165,233,0.35)]"
                    unoptimized
                    priority
                  />
                </div>
              ))}
            </div>

            {/* big hex with chest */}
            <div className="mt-6 flex items-center justify-center">
              <div className="relative w-48 aspect-square">
                <Image
                  src={sprites.bigHexYellow}
                  alt="crafting output"
                  fill
                  sizes="192px"
                  className="object-contain"
                  unoptimized
                  priority
                />
                <div className="absolute inset-0 m-auto w-24 h-24">
                  <Image
                    src={sprites.crate}
                    alt="crate"
                    fill
                    sizes="96px"
                    className="object-contain"
                    unoptimized
                    priority
                  />
                </div>
                {/* subtle badge sparkle (optional) */}
                <div className="absolute -top-2 -right-2 w-7 h-7">
                  <Image
                    src={sprites.chestBadge}
                    alt="badge"
                    fill
                    sizes="28px"
                    className="object-contain"
                    unoptimized
                    priority
                  />
                </div>
              </div>
            </div>
          </div>

          {/* right panel (copy) */}
          <div className="col-span-12 md:col-span-7 bg-[#0e2a48] p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Item Crafting System
            </h1>

            <p className="mt-6 text-lg leading-7 text-slate-200">
              Implement the Minecraft-like, grid-based, crafting system.
              Drag resources into the grid, based on their position,
              generate a new item. We have provided all of the art assets
              and the UI elements needed.
            </p>

            <div className="mt-7 flex items-center gap-4">
              <span className="text-white/90 font-semibold">Free</span>
              <Link
                href="#"
                className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-semibold hover:bg-white/10 transition"
              >
                Intermediate
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
