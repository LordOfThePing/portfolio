import ProjectsSection from "./components/projects-section";
import Introduction from "./components/introduction";
import ExperienceBanners from "./components/experience-banners";
import Particles from "./components/particles";
import LogoLoop from "./components/LogoLoop";
import {
  FaXTwitter,
  FaSuitcase,
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa6";
import { TbMailFilled } from "react-icons/tb";
import { socialLinks } from "./config";

const socialLogos = [
  { node: <FaSuitcase aria-hidden="true" />, title: "Resume / CV", href: socialLinks.cv },
  { node: <FaXTwitter aria-hidden="true" />, title: "X (Twitter)", href: socialLinks.twitter },
  { node: <FaGithub aria-hidden="true" />, title: "GitHub", href: socialLinks.github },
  { node: <FaInstagram aria-hidden="true" />, title: "Instagram", href: socialLinks.instagram },
  { node: <FaLinkedinIn aria-hidden="true" />, title: "LinkedIn", href: socialLinks.linkedin },
  { node: <TbMailFilled aria-hidden="true" />, title: "Email", href: socialLinks.email },
];

export default function Page() {
  return (
    <main className="relative min-h-screen ">
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

      <div className="w-5/6 mx-auto">
        <LogoLoop
          logos={socialLogos}
          speed={10}
          direction="left"
          logoHeight={28}
          gap={40}
          pauseOnHover
          scaleOnHover={true}
          fadeOut={true}
          ariaLabel="Enlaces sociales"
        />
      </div>
      <section className="relative mt-10 z-10">
        <Introduction />
        <ExperienceBanners />
        <ProjectsSection />
      </section>
    </main>
  );
}
