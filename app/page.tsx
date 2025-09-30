import Image from "next/image";
import { socialLinks } from "./config";
import ProjectsCollage from "./projectscollage/page";
import Link from "next/link";


export default function Page() {
  return (
    <section>
      <a href={socialLinks.linkedin} target="_blank">
        <Image
          src="/fotocv.jpg"
          alt="Profile picture"
          className="rounded-full block lg:-mt-3 -mt-3 lg:mb-2 mb-10 mx-auto sm:float-right sm:ml-5 sm:mb-5 grayscale hover:grayscale-0"
          unoptimized
          width={160}
          height={160}
          priority
        />
      </a>
      <h1 className="mb-8 text-2xl font-medium">
        welcome to my site! 👋 
      </h1>
      <div className="prose prose-neutral dark:prose-invert">
        <p>
          this is my personal space, made with the objective of having all my projects and thoughts in one place.
        </p>
        <p>
          currently a FullStack Engineer at {" "}
          <a href={socialLinks.globant} target="_blank" className="italic">
            Globant
          </a>
          , graduated in Computer Engineering at {" "}
          <a href={socialLinks.uba} target="_blank" className="italic">
            University of Buenos Aires (UBA)
          </a>
          , although i'm still a noob and/or rookie in most life aspects. unless in {""}
          <a
            className="italic"
            target="_blank"
            href={socialLinks.rocketleague}
            >
            Rocket League
          </a>
          , where i'm a god. (or at least i once was)
        </p>
        <p>
          you can {""}
          <a
            target="_blank"
            href={socialLinks.email}
            >
            email me
          </a>
          {""} for freelance work! 
        </p>

      </div>
      <ProjectsCollage />
      <div style={{
        position: 'relative',
        width: '100%',
        height: 0,
        paddingTop: '141.4286%',
        paddingBottom: 0,
        boxShadow: '0 2px 8px 0 rgba(63,69,81,0.16)',
        marginTop: '1.6em',
        marginBottom: '0.9em',
        overflow: 'hidden',
        borderRadius: '8px',
        willChange: 'transform'
      }}>
   
    <Link href="/cv.pdf" target="_blank" rel="noopener">
      Resume
    </Link>
        <iframe loading="lazy" style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, border: 'none', padding: 0, margin: 0 }}
          src="https://www.canva.com/design/DAEvcuLwit0/vsxsCvJ76C6G1dDZK6Ok9Q/view?embed" allowFullScreen={true} allow="fullscreen">
        </iframe>
      </div>
      <a href="https:&#x2F;&#x2F;www.canva.com&#x2F;design&#x2F;DAEvcuLwit0&#x2F;vsxsCvJ76C6G1dDZK6Ok9Q&#x2F;view?utm_content=DAEvcuLwit0&amp;utm_campaign=designshare&amp;utm_medium=embeds&amp;utm_source=link" target="_blank" rel="noopener">CV - Pedro Andrés Flynn</a>
    </section>
  );
}
