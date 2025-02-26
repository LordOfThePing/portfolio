"use client";

import React, { useState } from "react";
import Image from "next/image";

interface ImageGridProps {
  images: {
    src: string;
    alt: string;
    href: string;
    title: string; 
    shortDescription: string;
  }[];
  columns?: 2 | 3 | 4; // Accepts 2, 3, or 4 columns
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
          <div key={index} className="relative aspect-square group">
            <a
              onClick={() => setSelectedImage(image)}
              className="transform block w-full h-full grayscale-0 group-hover:grayscale transition duration-300 group-hover:scale-105 cursor-pointer"
            >
              <Image
                alt={image.alt}
                src={image.src}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                priority
                className="rounded-lg object-cover"
              />
            </a>
          
            <a onClick={() => setSelectedImage(image)} className="cursor-pointer"> 
            <div className="absolute inset-0 rounded-lg group-hover:scale-105 transform transition bg-black bg-opacity-70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 duration-300 p-3 text-center font-sans">
              <h2 className="text-md font-sans font-bold text -gray-100">{image.title}</h2>
              <p className="text-gray-50 text-xs">{image.shortDescription}</p>
            </div>
            </a>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div 
          onClick={() => setSelectedImage(null)}
          className={`fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300 ${selectedImage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <div className="relative"
              onClick={(e) => e.stopPropagation()}
              >
            <a href={selectedImage.href} target="_blank" rel="noopener noreferrer">
              <Image
                alt={selectedImage.alt}
                src={selectedImage.src}
                width={500}
                height={500}
                className="rounded-lg object-cover"
              />
            </a>
            <h2 className="text-lg font-bold mt-4 text-white text-center">{selectedImage.title}</h2>
            <p className="text-sm text-white text-center">{selectedImage.shortDescription}</p>
          </div>
        </div>
      )}
    </section>
  );
};
