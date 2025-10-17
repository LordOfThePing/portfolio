import ProjectsCollage from "./projectscollage/page";
import Introduction from "./introduction/page";
import ExperienceBanners from "./experiencebanners/page";
import Particles from "./components/particles";

export default function Page() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Full-page background */}
      <div className="fixed inset-0 -z-10">
        <Particles
          particleColors={["#ffffff", "#ffffff"]}
          particleCount={400}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>

      {/* Page content */}
      <section className="relative z-10">
        <Introduction />
        <ExperienceBanners />
        <ProjectsCollage />
      </section>
    </main>
  );
}
