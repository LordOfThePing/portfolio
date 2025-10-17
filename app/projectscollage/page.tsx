import React from "react";
import type { Metadata } from "next";
import { ImageGrid } from "app/components/image-grid";

export default function ProjectsCollage() {
  return (
    <section className="w-full py-10">
      <h1 className="text-md sm:text-xl font-bold text-left text-gray-800 dark:text-gray-100 mb-8 select-none">
        projects
      </h1>

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
            src: "/photos/tdl-url-shortener.png",
            alt: "url shortener",
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
            href: "https://github.com/LordOfThePing/22C2-Subite-A-La-Papaneta",
            title: "IRC Chat",
            shortDescription:
              "text messaging app for individual and group chat over a network",
          },
          {
            src: "/photos/software-architecture.jpg",
            alt: "Azure",
            href: "https://github.com/LordOfThePing/ASoft-trabajo-practico-2-nonamegroup",
            title: "Software Architecture Metrics",
            shortDescription:
              "testing endpoints in hosted in Azure with Artillery",
          },
          {
            src: "/photos/rdt.jpg",
            alt: "rdt",
            href: "https://github.com/LordOfThePing/TP-distribuidos",
            title: "Reliable Data Transfer via UDP",
            shortDescription:
              "upload & download of files implementing transfer protocols",
          },
          {
            src: "/photos/fiuba-logo-big.jpeg",
            alt: "fiuba",
            href: "https://github.com/LordOfThePing/fiuba_projects",
            title: "FIUBA University Projects",
            shortDescription:
              "a github repo with links to all my projects in my career",
          },
        ]}
      />
    </section>
  );
}
