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
            alt: "A.L.T.E.G.O.",
            href: "https://github.com/LordOfThePing/algo3_tp2",
            title: "A.L.T.E.G.O.",
            shortDescription: "un juego de mesa de táctica y estrategia de guerra.",
          },
          {
            src: "/photos/photo2.jpg",
            alt: "Big Ben",
            href: "https://unsplash.com/photos/big-ben-london-MdJq0zFUwrw?utm_content=creditShareLink&utm_medium=referral&utm_source=unsplash",
            title: "ROMAN COLUMNS",
            shortDescription: "A photo of Roman columns",
          },
          {
            src: "/photos/photo3.jpg",
            alt: "Sacré-Cœur Basilica",
            href: "https://unsplash.com/photos/a-view-of-the-inside-of-a-building-through-a-circular-window-Tp-3hrx88J4",
            title: "ROMAN COLUMNS",
            shortDescription: "A photo of Roman columns",
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

      <ImageGrid
        columns={2}
        images={[
          { src: "/photos/photo1.jpg", alt: "Roman columns" , 
            title: "ROMAN COLUMNS",
            shortDescription: "A photo of Roman columns",
          },
          { src: "/photos/photo2.jpg", alt: "Big Ben" , 
            title: "ROMAN COLUMNS",
            shortDescription: "A photo of Roman columns",
          },
          { src: "/photos/photo3.jpg", alt: "Sacré-Cœur Basilica" , 
            title: "ROMAN COLUMNS",
            shortDescription: "A photo of Roman columns",
          },
          { src: "/photos/photo4.jpg", alt: "Eiffel Tower" , 
            title: "ROMAN COLUMNS",
            shortDescription: "A photo of Roman columns",
          },
        ]}
      />

      <ImageGrid
        columns={4}
        images={[
          { src: "/photos/photo1.jpg", alt: "Roman columns" , 
            title: "ROMAN COLUMNS",
            shortDescription: "A photo of Roman columns",
          },
          { src: "/photos/photo2.jpg", alt: "Big Ben" , 
            title: "ROMAN COLUMNS",
            shortDescription: "A photo of Roman columns",
          },
          { src: "/photos/photo3.jpg", alt: "Sacré-Cœur Basilica" , 
            title: "ROMAN COLUMNS",
            shortDescription: "A photo of Roman columns",
          },
          { src: "/photos/photo4.jpg", alt: "Eiffel Tower" , 
            title: "ROMAN COLUMNS",
            shortDescription: "A photo of Roman columns",
          },
          { src: "/photos/photo5.jpg", alt: "Taj Mahal" , 
            title: "ROMAN COLUMNS",
            shortDescription: "A photo of Roman columns",
          },
          { src: "/photos/photo6.jpg", alt: "Colosseum" , 
            title: "ROMAN COLUMNS",
            shortDescription: "A photo of Roman columns",
          },
        ]}
      />
    </section>
  );
}
