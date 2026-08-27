import type { Metadata } from "next";
import Link from "next/link";
import { metaData, socialLinks } from "app/config";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms under which Pedro Andres Flynn, as an independent software engineer, provides websites, apps, integrations and automations.",
};

/** Bump this whenever the text below changes in a way that affects terms. */
const EFFECTIVE_DATE = "August 27, 2026";

const CONTACT_EMAIL = socialLinks.email.replace("mailto:", "");

const SECTIONS = [
  ["agreement", "1. Agreement to these terms"],
  ["who", "2. Who these terms apply to"],
  ["scope", "3. What these terms cover"],
  ["engagements", "4. Paid engagements and scope of work"],
  ["yourdata", "5. Your data and the privacy policy"],
  ["client-resp", "6. Client responsibilities"],
  ["acceptable-use", "7. Acceptable use"],
  ["no-warranty", "8. No warranty"],
  ["liability", "9. Limitation of liability"],
  ["ip", "10. Intellectual property"],
  ["confidentiality", "11. Confidentiality"],
  ["fees", "12. Fees and payments"],
  ["termination", "13. Termination"],
  ["law", "14. Governing law and jurisdiction"],
  ["changes", "15. Changes to these terms"],
  ["contact", "16. Contact"],
] as const;

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8 flex flex-col gap-3">
      <h2 className="text-base font-medium text-black dark:text-white">
        {title}
      </h2>
      {children}
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
      {children}
    </p>
  );
}

function List({ children }: { children: React.ReactNode }) {
  return (
    <ul className="flex flex-col gap-1.5 list-disc pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
      {children}
    </ul>
  );
}

function Term({ children }: { children: React.ReactNode }) {
  return (
    <strong className="font-medium text-black dark:text-white">
      {children}
    </strong>
  );
}

function Mail() {
  return (
    <a
      href={socialLinks.email}
      className="no-underline hover:underline underline-offset-4 text-black dark:text-white"
    >
      {CONTACT_EMAIL}
    </a>
  );
}

function PrivacyLink({ children }: { children: React.ReactNode }) {
  return (
    <Link
      href="/policy"
      className="no-underline hover:underline underline-offset-4 text-black dark:text-white"
    >
      {children}
    </Link>
  );
}

export default function TermsPage() {
  return (
    <article className="flex flex-col gap-8 w-full">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium text-black dark:text-white">
          Terms of Service
        </h1>
        <p className="text-[11px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Effective {EFFECTIVE_DATE}
        </p>
      </header>

      <div className="rounded-xl border border-black/10 dark:border-white/10 p-4 flex flex-col gap-3">
        <h2 className="text-sm font-medium text-black dark:text-white">
          The short version
        </h2>
        <List>
          <li>
            I am {metaData.name}, an independent software engineer building
            websites, apps, integrations and automations.
          </li>
          <li>
            These terms are the baseline for what I deliver and what I do not
            promise. For a specific paid project, the signed contract takes
            precedence.
          </li>
          <li>
            Both sides keep their own intellectual property, and I deliver the
            work I was commissioned to build.
          </li>
          <li>
            Long-term reliability of a system depends on the infrastructure it
            runs on; I build to reasonable industry standards rather than
            guaranteeing that a system will never fail.
          </li>
          <li>
            Questions: <Mail />. How I handle data is covered by the{" "}
            <PrivacyLink>privacy policy</PrivacyLink>.
          </li>
        </List>
      </div>

      <nav className="flex flex-col gap-2">
        <h2 className="text-[11px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Contents
        </h2>
        <ol className="flex flex-col gap-1 text-sm">
          {SECTIONS.map(([id, title]) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className="no-underline text-neutral-600 dark:text-neutral-300 hover:text-[#47a3f3] transition-colors"
              >
                {title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="h-px w-full bg-black/10 dark:bg-white/10" />

      <div className="flex flex-col gap-8">
        <Section id="agreement" title="1. Agreement to these terms">
          <P>
            These terms govern the websites, apps, integrations and automations
            built and operated by {metaData.name} (&ldquo;I&rdquo;,
            &ldquo;me&rdquo;), an independent software engineer. By using a
            system I operate under my own name, or by commissioning work from
            me, you agree to these terms.
          </P>
          <P>
            Where a signed contract exists &mdash; for a client engagement in
            particular &mdash; that contract governs the relationship, and these
            terms act as the general baseline where the contract is silent.
          </P>
        </Section>

        <Section id="who" title="2. Who these terms apply to">
          <List>
            <li>
              <Term>Visitors</Term> &mdash; anyone reading this website or
              using the links page.
            </li>
            <li>
              <Term>Users of my own services</Term> &mdash; anyone using an app
              or service I publish under my own name.
            </li>
            <li>
              <Term>Clients</Term> &mdash; people and organisations who engage
              me to design, build, deploy or maintain software for them.
            </li>
          </List>
          <P>
            If you are the end user of a system built for someone else, your
            relationship is with that organisation: they chose how it works and
            what it does with data, and their terms apply to you.
          </P>
        </Section>

        <Section id="scope" title="3. What these terms cover">
          <P>
            My work mostly involves connecting systems that already hold data
            and moving information between them automatically. This includes
            websites, web apps, application programming interfaces (APIs),
            integrations between third-party platforms, workflow automations,
            and the maintenance and support of those systems after delivery.
          </P>
          <P>
            These terms do not cover the third-party platforms I integrate with
            &mdash; those have their own terms and privacy policies, and I
            implement their rules rather than replacing them.
          </P>
        </Section>

        <Section
          id="engagements"
          title="4. Paid engagements and scope of work"
        >
          <P>
            For each client engagement, the specific deliverables, timeline,
            fees and ownership are set out in the proposal or contract for that
            project. Key principles apply to every engagement:
          </P>
          <List>
            <li>
              <Term>Scope.</Term> I deliver what is agreed in writing. New or
              changed requirements are handled as a change to the scope, which
              may affect cost and timing.
            </li>
            <li>
              <Term>Approvals.</Term> I build toward decisions and approvals you
              provide, and I need them in a reasonable time to keep the schedule.
            </li>
            <li>
              <Term>Dependencies.</Term> Delivery may depend on access to the
              systems and accounts the project needs. Delays in providing that
              access can shift the timeline.
            </li>
            <li>
              <Term>Maintenance is separate.</Term> Unless a maintenance
              agreement is signed, delivery of the project does not by itself
              include ongoing support, monitoring or uptime commitments.
            </li>
          </List>
        </Section>

        <Section id="yourdata" title="5. Your data and the privacy policy">
          <P>
            How I handle personal data &mdash; on this website, in my own
            services, and in client work &mdash; is set out in the{" "}
            <PrivacyLink>privacy policy</PrivacyLink>. That policy is part of
            these terms. In short: I do not sell personal data, I do not use it
            to train AI models, and in client work the client remains the
            controller of their data and I act on their instructions.
          </P>
        </Section>

        <Section id="client-resp" title="6. Client responsibilities">
          <P>When you commission work from me, you are responsible for:</P>
          <List>
            <li>
              Providing accurate requirements and confirming that the data your
              system handles may be processed for the purpose agreed.
            </li>
            <li>
              Ensuring you are authorised to use the third-party platforms and
              accounts involved, and that their own terms allow the integration.
            </li>
            <li>
              Providing the access I need (credentials, scopes, environments)
              on time, and revoking it when the engagement ends.
            </li>
            <li>
              Applying for, and holding, any licences or registrations your
              business needs to operate the system in your jurisdiction.
            </li>
          </List>
        </Section>

        <Section id="acceptable-use" title="7. Acceptable use">
          <P>You may not use a system I operate or build to:</P>
          <List>
            <li>
              Break any law, or infringe anyone&rsquo;s rights, including
              intellectual property and privacy rights.
            </li>
            <li>
              Send unsolicited bulk messages, or process data you are not
              authorised to process.
            </li>
            <li>
              Attempt to damage, overload or gain unauthorised access to a
              system, account or connected service.
            </li>
            <li>
              Use the system in a way that is deceptive, fraudulent or harmful
              to others.
            </li>
          </List>
          <P>
            I may suspend a system or refuse a request where I reasonably
            believe it would breach this section or applicable law.
          </P>
        </Section>

        <Section id="no-warranty" title="8. No warranty">
          <P>
            Software is delivered &ldquo;as is&rdquo;, and I build it to
            reasonable industry standards rather than guaranteeing that it will
            be error-free or never fail. Third-party platforms change their
            APIs, features and terms without notice, and an integration can
            break when they do. Unless a specific service-level agreement is
            signed for a project, I do not warrant uninterrupted availability,
            and I am not liable for outages or data loss caused by third-party
            services the system relies on.
          </P>
        </Section>

        <Section id="liability" title="9. Limitation of liability">
          <P>
            To the maximum extent permitted by law, my total liability
            arising out of or related to a project is limited to the amount you
            paid me for that project in the twelve months before the claim
            arose.
          </P>
          <P>
            I am not liable for indirect or consequential loss: lost profits,
            lost revenue, lost data, loss of goodwill, or business interruption,
            whether arising in contract, tort (including negligence) or
            otherwise.
          </P>
          <P>
            This limitation does not apply where it would be unlawful &mdash;
            for example, for liability that cannot be excluded under the law of
            your jurisdiction, or for damages caused with intent or gross
            negligence.
          </P>
        </Section>

        <Section id="ip" title="10. Intellectual property">
          <List>
            <li>
              <Term>Your property.</Term> You retain all rights in your data,
              content and any materials you provide.
            </li>
            <li>
              <Term>My work product.</Term> On full payment, ownership of the
              custom code I write for a client project passes to you, unless the
              contract says otherwise.
            </li>
            <li>
              <Term>My pre-existing work.</Term> Reusable components, libraries
              and tooling I built before or outside your project remain mine,
              and I may reuse them in other projects. This is normal practice and
              does not affect your ownership of the project-specific work.
            </li>
            <li>
              <Term>Third-party tools.</Term> Anything licensed from a third
              party, such as a library, platform or service, remains subject to
              that third party&rsquo;s licence, which may impose its own terms
              on you.
            </li>
          </List>
        </Section>

        <Section id="confidentiality" title="11. Confidentiality">
          <P>
            I keep confidential any non-public information you share for a
            project &mdash; business plans, data, credentials, source access and
            the like &mdash; and I use it only to do the work. This obligation
            survives the end of the project. It does not apply to information
            that becomes public through no fault of mine, that I am required to
            disclose by law, or that you have explicitly allowed me to share.
          </P>
        </Section>

        <Section id="fees" title="12. Fees and payments">
          <P>
            Fees are agreed per project as set out in the proposal or contract.
            I do not store payment card details; payments are processed by a
            regulated payment provider. Invoices are payable by the date stated,
            and I may pause work on a project if an invoice remains overdue.
          </P>
        </Section>

        <Section id="termination" title="13. Termination">
          <P>
            Either side may end a project early by written notice, subject to
            terms in the contract. On termination, I will stop work, hand over
            completed work product against payment for work done to that point,
            return or delete any of your data under my control as instructed,
            and revoke the access you granted me &mdash; except where the law
            requires me to keep something.
          </P>
        </Section>

        <Section id="law" title="14. Governing law and jurisdiction">
          <P>
            I work from Argentina, and these terms are governed by Argentine
            law. For visitors and small matters, I prefer to resolve any dispute
            informally by email first &mdash; write to <Mail /> before pursuing
            formal action. Where a dispute proceeds formally, it will be brought
            in the courts of the Federal Capital of Argentina, unless the law of
            your jurisdiction does not permit that.
          </P>
        </Section>

        <Section id="changes" title="15. Changes to these terms">
          <P>
            I may update these terms as the work changes. The effective date at
            the top always reflects the current version. If a change would
            materially affect an ongoing engagement, I will flag it to that
            client directly rather than making it silently.
          </P>
        </Section>

        <Section id="contact" title="16. Contact">
          <P>{metaData.name} &mdash; independent software engineer, Argentina.</P>
          <P>
            Email: <Mail />
            <br />
            Web:{" "}
            <Link
              href="/"
              className="no-underline hover:underline underline-offset-4 text-black dark:text-white"
            >
              {metaData.title}
            </Link>
          </P>
        </Section>
      </div>
    </article>
  );
}
