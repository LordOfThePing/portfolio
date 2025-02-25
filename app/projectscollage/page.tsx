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
            shortDescription: "un juego de mesa de táctica y estrategia de guerra.",
          },
          {
            src: "/gifs/tdl-url-shortener.gif",
            alt: "tech gif",
            href: "https://github.com/gabokatta/tdl-urlshort",
            title: "URL Shortener",
            shortDescription: "acortador de URLs hecho en Kotlin.",
          },
          {
            src: "/photos/minesweeper_rust.jpg",
            alt: "Minesweeper in Rust",
            href: "https://github.com/LordOfThePing/tp1taller",
            title: "Rust Minesweeper",
            shortDescription: "A minesweeper made in Rust.",
          },
          {
            src: "/photos/photo4.jpg",
            alt: "Eiffel Tower",
            href: "https://unsplash.com/photos/the-eiffel-tower-towering-over-the-city-of-paris-OgPuPvPsHLM?utm_content=creditShareLink&utm_medium=referral&utm_source=unsplash",
            title: "ROMAN COLUMNS",
            shortDescription: "A photo of Roman columns",
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
