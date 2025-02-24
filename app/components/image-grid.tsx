import React from "react";
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
              target="_blank"
              rel="noopener noreferrer"
              href={image.href}
              className="transform block w-full h-full grayscale group-hover:grayscale-0 transition duration-300 group-hover:scale-105"
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
          
            <a href={image.href} target="_blank"> 
            <div className="absolute inset-0 rounded-lg group-hover:scale-105 transform transition bg-black bg-opacity-70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 duration-300 p-5 text-center font-sans">
              <h2 className="text-md font-sans font-bold text -gray-100">{image.title}</h2>
              <p className="text-gray-50 text-xs">{image.shortDescription}</p>
            </div>
            </a>
          </div>
        ))}
      </div>
    </section>
  );
};
