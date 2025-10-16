"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FaGithub } from "react-icons/fa";

interface ImageGridProps {
  images: {
    src: string;
    alt: string;
    href: string;
    title: string;
    shortDescription: string;
  }[];
  columns?: 2 | 3 | 4;
}

export const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  columns = 3,
}) => {
  const [selectedImage, setSelectedImage] = useState<null | {
    src: string;
    alt: string;
    href: string;
    title: string;
    shortDescription: string;
  }>(null);

  const gridClass = {
    2: "grid-cols-2 sm:grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-4",
  }[columns];

  return (
    <section>
      <div className={`grid ${gridClass} gap-4 my-8`}>
        {images.map((image, index) => (
          <div key={index} className="relative aspect-square group select-none">
            <div
              onClick={() => setSelectedImage(image)}
              className="transform block w-full h-full grayscale-0 group-hover:grayscale transition duration-300 group-hover:scale-105 cursor-pointer select-none"
            >
              <Image
                alt={image.alt}
                src={image.src}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                priority
                className="rounded-lg object-cover select-none"
                draggable={false}
              />
            </div>

            <div
              onClick={() => setSelectedImage(image)}
              className="absolute inset-0 rounded-lg group-hover:scale-105 transform transition bg-black bg-opacity-70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 duration-300 p-3 text-center font-sans cursor-pointer select-none"
            >
              <h2 className="text-md text-gray-100 font-bold select-none">{image.title}</h2>
              <p className="text-gray-50 text-xs select-none">{image.shortDescription}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className={`fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300 ${
            selectedImage ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          } select-none`}
        >
          <div
            className="relative flex flex-col items-center select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              alt={selectedImage.alt}
              src={selectedImage.src}
              width={500}
              height={500}
              className="rounded-lg object-cover select-none"
              draggable={false}
            />
            <h2 className="text-lg font-bold mt-4 text-white text-center select-none">
              {selectedImage.title}
            </h2>
            <p className="text-sm text-white text-center select-none">
              {selectedImage.shortDescription}
            </p>

            {/* GitHub Button */}
            <a
              href={selectedImage.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-800 hover:bg-gray-700 transition duration-300 shadow-md"
            >
              <FaGithub className="text-white text-2xl" />
            </a>
          </div>
        </div>
      )}
    </section>
  );
};
