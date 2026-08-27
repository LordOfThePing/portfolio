import type { Metadata } from "next";
import Link from "next/link";
import { metaData, socialLinks } from "app/config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Pedro Andres Flynn handles personal data in this website and in the apps, integrations and automations he builds and operates.",
};

/** Bump this whenever the text below changes in a way that affects users. */
const EFFECTIVE_DATE = "August 27, 2026";

const CONTACT_EMAIL = socialLinks.email.replace("mailto:", "");

const SECTIONS = [
  ["scope", "1. Who this policy covers"],
  ["roles", "2. My two roles: controller and processor"],
  ["site", "3. This website"],
  ["apps", "4. Apps, integrations and automations I build"],
  ["data", "5. What data I process, and why"],
  ["subprocessors", "6. Service providers I rely on"],
  ["google", "7. Google user data and Limited Use"],
  ["messaging", "8. Messaging platform data"],
  ["ai", "9. AI and automated processing"],
  ["payments", "10. Payments"],
  ["retention", "11. How long data is kept"],
  ["security", "12. Security"],
  ["transfers", "13. International transfers"],
  ["rights", "14. Your rights"],
  ["children", "15. Children"],
  ["changes", "16. Changes to this policy"],
  ["contact", "17. Contact"],
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

function Out({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="no-underline hover:underline underline-offset-4 text-black dark:text-white"
    >
      {children}
    </a>
  );
}

export default function PolicyPage() {
  return (
    <article className="flex flex-col gap-8 w-full">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium text-black dark:text-white">
          Privacy Policy
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
            I am {metaData.name}, an independent software engineer. I build
            websites, apps, integrations and automations.
          </li>
          <li>
            This website sets no advertising or tracking cookies, and its
            analytics are aggregate &mdash; it does not build a profile of you.
          </li>
          <li>
            When I build something for a client, the data inside it belongs to
            that client. I process it on their instructions, and their privacy
            policy governs it.
          </li>
          <li>
            I do not sell personal data, and I do not use client or end-user
            data to train AI models.
          </li>
          <li>
            Questions or requests: <Mail />.
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
        <Section id="scope" title="1. Who this policy covers">
          <P>
            This policy is published by {metaData.name} (&ldquo;I&rdquo;,
            &ldquo;me&rdquo;), an independent software engineer working as a
            sole practitioner. It explains how personal data is handled across
            everything I operate as a developer:
          </P>
          <List>
            <li>
              <Term>This website</Term> &mdash; {metaData.title}, including the
              blog and the links page.
            </li>
            <li>
              <Term>Apps and services I publish myself</Term> &mdash; anything
              released under my own name, where I decide what data is collected
              and why.
            </li>
            <li>
              <Term>Client work</Term> &mdash; apps, integrations, workflows and
              automations I design, build, deploy or maintain for a client,
              where the client decides what data is collected and why.
            </li>
          </List>
          <P>
            Which of these applies changes who is responsible for the data, so
            the next section sets that out before anything else.
          </P>
        </Section>

        <Section id="roles" title="2. My two roles: controller and processor">
          <P>
            Data protection law distinguishes between the party that decides why
            data is processed (the <Term>controller</Term>) and the party that
            processes it on that party&rsquo;s behalf (the{" "}
            <Term>processor</Term>). I act in both roles depending on the
            project.
          </P>
          <List>
            <li>
              <Term>I am the controller</Term> for this website and for any app
              or service I publish under my own name. This policy governs that
              data directly.
            </li>
            <li>
              <Term>I am a processor</Term> for client work. The client is the
              controller: it is their system, their users and their data. I
              handle that data only to build, run, debug and maintain what they
              hired me to deliver, following their documented instructions and
              the contract between us. Their own privacy policy &mdash; not this
              one &mdash; tells their users how that data is used.
            </li>
          </List>
          <P>
            If you are the end user of an app or automation I built for someone
            else and you want your data corrected or deleted, the fastest route
            is to contact that organisation. If you contact me instead, I will
            pass the request on to them and help them action it.
          </P>
        </Section>

        <Section id="site" title="3. This website">
          <P>
            The site is a static-first Next.js application. It has no ad
            network, no third-party tracking pixels and no advertising cookies.
            Concretely, this is everything it records:
          </P>
          <List>
            <li>
              <Term>Aggregate analytics.</Term> Vercel Web Analytics and Speed
              Insights count page views and measure loading performance. They
              are cookieless and report in aggregate; they are not used to
              identify individual visitors.
            </li>
            <li>
              <Term>Link counters.</Term> The links page stores one anonymous
              row per visit or outbound click: an event type, which link was
              clicked, a timestamp, and a flag for whether it was that
              browser&rsquo;s first visit. No IP address, no user agent, and no
              identifier tying events to a person or to each other.
            </li>
            <li>
              <Term>Browser storage.</Term> Your theme preference (light or
              dark) and a single flag used to avoid counting the same browser as
              a new visitor twice are stored in your browser&rsquo;s
              localStorage. Both stay on your device and are never transmitted
              to me. Clearing site data removes them.
            </li>
            <li>
              <Term>Server logs.</Term> The hosting provider keeps standard
              request logs, which include IP addresses, for security and
              troubleshooting. I do not mine them for analytics.
            </li>
            <li>
              <Term>Email you send me.</Term> If you email me, I keep the
              message and your address for as long as needed to reply and to
              keep a record of our correspondence.
            </li>
          </List>
          <P>
            The administrative area of the site is for my own use and is
            protected by a signed session cookie. That cookie is strictly
            necessary, is set only when I log in, and is never set for visitors.
          </P>
        </Section>

        <Section
          id="apps"
          title="4. Apps, integrations and automations I build"
        >
          <P>
            Most of my work involves connecting systems that already hold data
            &mdash; CRMs, spreadsheets, databases, messaging platforms, payment
            providers, internal tools &mdash; and moving information between
            them automatically. This shapes how I handle data:
          </P>
          <List>
            <li>
              <Term>Data minimisation by design.</Term> An integration reads and
              writes the fields it needs to do its job, and no more. I do not
              add speculative collection in case it proves useful later.
            </li>
            <li>
              <Term>Data stays in the client&rsquo;s systems.</Term> Wherever
              possible, automations run inside infrastructure and accounts owned
              by the client, using their credentials. I avoid creating parallel
              copies of their data under my control.
            </li>
            <li>
              <Term>Access is scoped and temporary.</Term> When I need access to
              a client system to build or fix something, I ask for the narrowest
              permissions that work, and I ask for that access to be revoked
              when the engagement ends.
            </li>
            <li>
              <Term>Credentials are never hardcoded.</Term> API keys, tokens and
              connection strings live in environment variables or a secret
              manager, never in source code.
            </li>
            <li>
              <Term>Development data.</Term> For testing I use synthetic or
              anonymised data by default. If a client instructs me to work with
              real production data, it stays in their environment and is not
              copied beyond what the task requires.
            </li>
            <li>
              <Term>Logs and error reports.</Term> Automations produce execution
              logs that can incidentally contain personal data &mdash; a
              customer name inside a failed message payload, for example. I keep
              these only as long as needed to diagnose problems, and I configure
              redaction where the platform supports it.
            </li>
          </List>
        </Section>

        <Section id="data" title="5. What data I process, and why">
          <P>
            Depending on the project, the categories below may pass through
            systems I build or maintain. In client work these are processed on
            the client&rsquo;s instructions and for their purposes.
          </P>
          <List>
            <li>
              <Term>Identity and contact data</Term> &mdash; names, email
              addresses, phone numbers, company and role. Used to deliver the
              function the system exists for: routing a message, creating a
              record, sending a notification.
            </li>
            <li>
              <Term>Account and authentication data</Term> &mdash; user
              identifiers, access tokens and permission scopes. Used to connect
              systems on the account holder&rsquo;s authorisation.
            </li>
            <li>
              <Term>Content data</Term> &mdash; messages, form submissions,
              documents and records that flow through an automation. Used only
              in transit and for the processing step requested.
            </li>
            <li>
              <Term>Transaction data</Term> &mdash; order references, amounts
              and statuses. Used to reconcile and to trigger downstream steps.
            </li>
            <li>
              <Term>Technical data</Term> &mdash; timestamps, execution
              identifiers and error traces. Used for reliability, debugging and
              security.
            </li>
            <li>
              <Term>My own business contacts</Term> &mdash; the details of
              clients and prospective clients, kept to quote, invoice and
              communicate about work. My legal basis is performance of a
              contract and my legitimate interest in running my practice.
            </li>
          </List>
          <P>
            I do not sell personal data, I do not share it with data brokers,
            and I do not use it for advertising or profiling.
          </P>
        </Section>

        <Section id="subprocessors" title="6. Service providers I rely on">
          <P>
            I use established providers rather than running my own
            infrastructure. For the systems I operate directly, these are the
            main ones:
          </P>
          <List>
            <li>
              <Term>Vercel</Term> and <Term>Netlify</Term> &mdash; hosting,
              delivery and aggregate analytics for this website.
            </li>
            <li>
              <Term>Supabase</Term> &mdash; the database behind this
              site&rsquo;s blog posts, link configuration and anonymous
              counters.
            </li>
            <li>
              <Term>Google Workspace</Term> &mdash; email and documents used to
              correspond and to run my practice.
            </li>
          </List>
          <P>
            Client projects use whatever providers that client has chosen
            &mdash; typically a cloud host, a database, an automation platform
            such as n8n, a messaging provider, a payment provider such as
            Mercado Pago, and in some cases an AI model provider. The specific
            list for a given system belongs in that system&rsquo;s own privacy
            notice, because the client selects those vendors and holds the
            contracts with them. On request I will confirm the providers
            involved in any system I built for you.
          </P>
        </Section>

        <Section id="google" title="7. Google user data and Limited Use">
          <P>
            Some integrations I build connect to Google APIs &mdash; Gmail,
            Drive, Calendar or Sheets, for example &mdash; using OAuth. When
            that happens:
          </P>
          <List>
            <li>
              Access is granted by you, explicitly, through Google&rsquo;s own
              consent screen, and you can revoke it at any time at{" "}
              <Out href="https://myaccount.google.com/permissions">
                myaccount.google.com/permissions
              </Out>
              .
            </li>
            <li>
              Only the scopes required for the requested feature are asked for.
            </li>
            <li>
              Google user data is used solely to provide and improve that
              feature. It is never sold, never used for advertising, and never
              used to train generalised AI or machine learning models.
            </li>
            <li>
              It is not transferred to others except as needed to provide the
              feature, to comply with applicable law, or as part of a merger or
              acquisition &mdash; and it is not read by humans except with your
              explicit consent, to resolve a specific support issue you have
              raised, for security purposes, or where required by law.
            </li>
          </List>
          <P>
            Any application I publish that accesses Google user data complies
            with the{" "}
            <Out href="https://developers.google.com/terms/api-services-user-data-policy">
              Google API Services User Data Policy
            </Out>
            , including its Limited Use requirements.
          </P>
        </Section>

        <Section id="messaging" title="8. Messaging platform data">
          <P>
            Automations that connect to messaging platforms &mdash; WhatsApp
            Business, Telegram, Slack, email and similar &mdash; process the
            messages needed to perform the requested action, such as replying,
            routing a conversation or creating a record in another system.
            Message content is used for that purpose only. It is not used for
            advertising, is not sold, and is retained only as long as the
            workflow and the client&rsquo;s retention rules require. Use of each
            platform is also subject to that platform&rsquo;s own terms and
            privacy policy.
          </P>
        </Section>

        <Section id="ai" title="9. AI and automated processing">
          <P>
            Some systems I build use AI models to classify, summarise, extract
            or draft content. Where that is the case:
          </P>
          <List>
            <li>
              The data sent to a model is limited to what the task needs, and
              the model provider is used under terms that do not permit training
              on that data.
            </li>
            <li>
              I do not use client data or end-user data to train models of my
              own.
            </li>
            <li>
              AI output is treated as a suggestion. I do not design systems that
              make legally or similarly significant decisions about a person
              without a human being able to review them.
            </li>
          </List>
        </Section>

        <Section id="payments" title="10. Payments">
          <P>
            I do not collect or store card numbers. When a system I build takes
            payments, that flow is handled by a regulated payment provider that
            receives the payment details directly. What comes back to the system
            is a transaction reference and status, not the instrument itself.
            Invoices between me and my clients are kept for as long as tax and
            accounting law requires.
          </P>
        </Section>

        <Section id="retention" title="11. How long data is kept">
          <List>
            <li>
              <Term>This site&rsquo;s anonymous counters</Term> &mdash; kept
              indefinitely, because the rows contain no personal data.
            </li>
            <li>
              <Term>Server logs</Term> &mdash; kept for the retention window set
              by the hosting provider, typically measured in days.
            </li>
            <li>
              <Term>Automation execution logs</Term> &mdash; kept only as long
              as useful for debugging, then pruned.
            </li>
            <li>
              <Term>Client data</Term> &mdash; kept for the duration of the
              engagement. When it ends, I return or delete any copies under my
              control and revoke my access, except where I must retain something
              by law.
            </li>
            <li>
              <Term>Correspondence and invoices</Term> &mdash; kept for the
              period required by tax and accounting obligations.
            </li>
          </List>
        </Section>

        <Section id="security" title="12. Security">
          <P>
            The measures I apply are proportionate to a one-person practice
            working inside other people&rsquo;s systems: encryption in transit
            everywhere; secrets kept in environment variables or a secret
            manager and never committed to source control; least-privilege,
            scoped and revocable credentials; multi-factor authentication on the
            accounts that matter; server-side keys that never reach the browser;
            row-level security enabled on database tables; and full-disk
            encryption plus a password manager on my working machine.
          </P>
          <P>
            No system is perfectly secure. If a breach affects data I control, I
            will notify affected people and the relevant authority as required
            by law. If it affects data I process for a client, I will notify
            that client without undue delay so they can meet their own
            obligations.
          </P>
        </Section>

        <Section id="transfers" title="13. International transfers">
          <P>
            I work from Argentina, and the providers above operate globally, so
            data may be processed outside your country. Where the law requires a
            transfer safeguard, I rely on the mechanisms offered by those
            providers, such as standard contractual clauses. For client
            projects, hosting region is a decision the client makes and I
            implement.
          </P>
        </Section>

        <Section id="rights" title="14. Your rights">
          <P>
            Depending on where you live, you may have the right to access a copy
            of your data, to have it corrected or deleted, to restrict or object
            to its processing, to receive it in a portable format, and to
            withdraw consent you previously gave. Under Argentina&rsquo;s
            Personal Data Protection Act you may also address the national data
            protection authority; in the EEA and the UK you may complain to your
            local supervisory authority.
          </P>
          <P>
            To exercise any of these, email <Mail />. I will respond within the
            period the applicable law allows. If the data belongs to a system I
            built for a client, see section 2 &mdash; I will forward your
            request to them.
          </P>
        </Section>

        <Section id="children" title="15. Children">
          <P>
            This website and my services are directed at businesses and
            professionals, not children. I do not knowingly collect data from
            children. If you believe a child&rsquo;s data has reached a system I
            operate, contact me and it will be deleted.
          </P>
        </Section>

        <Section id="changes" title="16. Changes to this policy">
          <P>
            I may update this policy as the work changes. The effective date at
            the top always reflects the current version. Material changes will
            be summarised here rather than made silently.
          </P>
        </Section>

        <Section id="contact" title="17. Contact">
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
