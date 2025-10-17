"use client";

import React from "react";
import LogoLoop from "./LogoLoop"; // ajustá la ruta si corresponde
import {
  FaXTwitter,
  FaSuitcase,
  FaGithub,
  FaInstagram,
  FaRss,
  FaLinkedinIn,
} from "react-icons/fa6";
import { TbMailFilled } from "react-icons/tb";
import { metaData, socialLinks } from "app/config";

const YEAR = new Date().getFullYear();

/**
 * LogoLoop espera un array de items con { node, title, href }.
 * Reutilizamos tus URLs de socialLinks y los íconos como "node".
 */
const socialLogos = [
  { node: <FaSuitcase aria-hidden="true" />, title: "Resume / CV", href: socialLinks.cv },
  { node: <FaXTwitter aria-hidden="true" />, title: "X (Twitter)", href: socialLinks.twitter },
  { node: <FaGithub aria-hidden="true" />, title: "GitHub", href: socialLinks.github },
  { node: <FaInstagram aria-hidden="true" />, title: "Instagram", href: socialLinks.instagram },
  { node: <FaLinkedinIn aria-hidden="true" />, title: "LinkedIn", href: socialLinks.linkedin },
  { node: <TbMailFilled aria-hidden="true" />, title: "Email", href: socialLinks.email }, // mailto:
  { node: <FaRss aria-hidden="true" />, title: "RSS", href: "/rss.xml" },                 // interno
];

export default function Footer() {
  return (
    <footer className="text-[#1C1C1C] dark:text-[#D4D4D4]">
      {/* Línea superior sutil */}
      <div className="h-px w-full bg-black/10 dark:bg-white/10 mb-6" />

      {/* Loop de logos de redes */}
      <div
        className="relative overflow-hidden"
        style={{ height: 56 }} // algo más que el icono para respiración
        aria-label="Mis redes y enlaces"
      >
        <LogoLoop
          logos={socialLogos}
          speed={80}                // igual que el ejemplo
          direction="left"
          logoHeight={28}            // tamaño del ícono dentro del loop
          gap={40}
          pauseOnHover
          scaleOnHover={true}
          fadeOut={true}
          // Usa el color del fondo actual para el fade; si tu LogoLoop
          // soporta color por prop, dejamos un fallback neutro:
          fadeOutColor="transparent"
          ariaLabel="Enlaces sociales"
        />
      </div>

      {/* Pie con © y título/baseUrl */}
      <small className="block mt-6">
        <time>© {YEAR}</time>{" "}
        <a
          className="no-underline hover:underline underline-offset-4"
          href={metaData.baseUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {metaData.title}
        </a>
      </small>

      {/* Estilo responsive heredado del snippet original */}
      <style jsx>{`
        @media screen and (max-width: 480px) {
          article {
            padding-top: 2rem;
            padding-bottom: 4rem;
          }
        }
      `}</style>
    </footer>
  );
}
