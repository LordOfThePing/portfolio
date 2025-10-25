import ProjectsCollage from "./projectscollage/page";
import Introduction from "./introduction/page";
import ExperienceBanners from "./experiencebanners/page";
import Particles from "./components/particles";
import LogoLoop from "./components/LogoLoop";
import {
  FaXTwitter,
  FaSuitcase,
  FaGithub,
  FaInstagram,
  FaRss,
  FaLinkedinIn,
} from "react-icons/fa6";
import { TbMailFilled } from "react-icons/tb";
import { socialLinks } from "./config";
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

export default function Page() {
  return (
    <main className="relative min-h-screen ">
      {/* Full-page background */}
      <div className="fixed inset-0 -z-10">
        <Particles
          particleColors={["#ffffff", "#ffffff"]}
          particleCount={400}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={70}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>

      {/* Page content */}
      <div className="w-5/6 mx-auto">

        <LogoLoop
                  logos={socialLogos}
                  speed={10}                // igual que el ejemplo
                  direction="left"
                  logoHeight={28}            // tamaño del ícono dentro del loop
                  gap={40}
                  pauseOnHover
                  scaleOnHover={true}
                  fadeOut={true}
                  // Usa el color del fondo actual para el fade; si tu LogoLoop
                  // soporta color por prop, dejamos un fallback neutro:
                  fadeOutColor="#121212"
                  ariaLabel="Enlaces sociales"
                  />
      </div>
      <section className="relative mt-10 z-10">
        <Introduction />
        <ExperienceBanners />
        <ProjectsCollage />
      </section>
    </main>
  );
}
