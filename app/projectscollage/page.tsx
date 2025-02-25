import React from "react";
import type { Metadata } from "next";
import { ImageGrid } from "app/components/image-grid";

export const metadata: Metadata = {
  title: "Project's collage",
  description: "A collage of my projects",
};

export default function ProjectsCollage() {
  return (
    <section>
      <ImageGrid
        columns={3}
        images={[
          {
            src: "/photos/tableroTEG.png",
            alt: "TEG image",
            href: "https://github.com/LordOfThePing/algo3_tp2",
            title: "A.L.T.E.G.O.",
            shortDescription: "war strategy and tactics game",
          },
          {
            src: "/gifs/tdl-url-shortener.gif",
            alt: "tech gif",
            href: "https://github.com/gabokatta/tdl-urlshort",
            title: "URL Shortener",
            shortDescription: "Kotlin-made url shortener",
          },
          {
            src: "/photos/minesweeper_rust.jpg",
            alt: "Minesweeper in Rust",
            href: "https://github.com/LordOfThePing/tp1taller",
            title: "Rust Minesweeper",
            shortDescription: "the title is self-explanatory",
          },
          {
            src: "/gifs/irc-chat.gif",
            alt: "Irc-chat",
            href: "https://github.com/taller-1-fiuba-rust/22C2-Subite-A-La-Papaneta",
            title: "IRC Chat",
            shortDescription: "text messaging app for individual and group chat over a network",
          },
          {
            src: "/photos/photo5.jpg",
            alt: "Taj Mahal",
            href: "https://unsplash.com/photos/taj-mahal-india-IPlPkWPJ2fo",
            title: "ROMAN COLUMNS",
            shortDescription: "A photo of Roman columns",
          },
          {
            src: "/photos/photo6.jpg",
            alt: "Colosseum",
            href: "https://unsplash.com/photos/brown-concrete-building-under-blue-sky-during-daytime-3cyBR1rIJmA?utm_content=creditShareLink&utm_medium=referral&utm_source=unsplash",
            title: "ROMAN COLUMNS",
            shortDescription: "A photo of Roman columns",
          },
        ]}
      />

    </section>
  );
}
