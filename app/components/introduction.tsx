import Image from "next/image";
import { socialLinks } from "app/config";

export default function Introduction() {
  return (
    <section>
      <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
        <Image
          src="/fotocv.jpg"
          alt="Profile picture"
          className="rounded-full block lg:mt-0 -mt-0 lg:mb-2 mb-10 mx-auto sm:float-right sm:ml-5 sm:mb-5 grayscale hover:grayscale-0"
          unoptimized
          width={160}
          height={160}
          priority
        />
      </a>
      <h1 className="mb-8 text-2xl font-medium">welcome to my site! 👋</h1>
      <div className="prose prose-neutral dark:prose-invert">
        <p>
          this is my personal space, made with the objective of having all my
          projects and thoughts in one place.
        </p>
        <p>
          currently a FullStack Engineer at{" "}
          <a href={socialLinks.globant} target="_blank" rel="noopener noreferrer" className="italic">
            Globant
          </a>
          , graduated in Computer Engineering at{" "}
          <a href={socialLinks.uba} target="_blank" rel="noopener noreferrer" className="italic">
            University of Buenos Aires (UBA)
          </a>
          , although i&apos;m still a noob and/or rookie in most life aspects.
          unless in{" "}
          <a
            className="italic"
            target="_blank"
            rel="noopener noreferrer"
            href={socialLinks.rocketleague}
          >
            Rocket League
          </a>
          , where i&apos;m a god. (or at least i once was).
        </p>
        <p>
          I strive to improve and surpass myself everyday, trying to focus on
          things that challenge me and make me grow.
        </p>
        <p>
          you can{" "}
          <a target="_blank" rel="noopener noreferrer" href={socialLinks.email}>
            email me
          </a>{" "}
          for freelance work!
        </p>
      </div>
    </section>
  );
}
