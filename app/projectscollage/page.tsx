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
            shortDescription: "not the actual game, but a board translator",
          },
          {
            src: "/gifs/irc-chat.gif",
            alt: "Irc-chat",
            href: "https://github.com/taller-1-fiuba-rust/22C2-Subite-A-La-Papaneta",
            title: "IRC Chat",
            shortDescription: "text messaging app for individual and group chat over a network",
          },
          {
            src: "/photos/software-architecture.jpg",
            alt: "Azure",
            href: "https://github.com/LordOfThePing/arquiDelSoftware2C22",
            title: "Software Architecture Metrics",
            shortDescription: "testing endpoints in hosted in Azure with Artillery",
          },
          {
            src: "/photos/rdt.jpg",
            alt: "rdt",
            href: "https://github.com/FranciscoGauna/TP-distribuidos",
            title: "Reliable Data Transfer via UDP",
            shortDescription: "upload & download of files implementing transfer protocols",
          },
        ]}
      />

    </section>
  );
}
