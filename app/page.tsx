import ProjectsCollage from "./projectscollage/page";
import Introduction from "./introduction/page";
import ExperienceBanners from "./experiencebanners/page";


export default function Page() {
  return (
    <section>
      <Introduction />
      
      <ExperienceBanners />
      <ProjectsCollage />

    </section>
  );
}
