import type { Metadata } from "next";
import Link from "next/link";
import { metaData, socialLinks } from "app/config";

export const metadata: Metadata = {
  title: "Data Deletion Instructions",
  description:
    "How to request deletion of your personal data from this website and from apps, integrations and automations built by Pedro Andres Flynn.",
};

const EFFECTIVE_DATE = "August 27, 2026";

const CONTACT_EMAIL = socialLinks.email.replace("mailto:", "");

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

function OL({ children }: { children: React.ReactNode }) {
  return (
    <ol className="flex flex-col gap-1.5 list-decimal pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
      {children}
    </ol>
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
      href={`${socialLinks.email}?subject=Data%20deletion%20request`}
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

export default function DataDeletionPage() {
  return (
    <article className="flex flex-col gap-8 w-full">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium text-black dark:text-white">
          Data Deletion Instructions
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
            To request deletion of your data, email <Mail /> with the subject{" "}
            <Term>Data deletion request</Term>.
          </li>
          <li>
            Include the email address, username or account you used, and the
            app or service the data lives in.
          </li>
          <li>
            You will receive an acknowledgement within 7 days and the deletion
            will be completed within 30 days, unless the law requires me to
            keep something.
          </li>
          <li>
            If the data belongs to an app I built for a client, I will forward
            your request to them, since they are the controller.
          </li>
        </List>
      </div>

      <div className="h-px w-full bg-black/10 dark:bg-white/10" />

      <div className="flex flex-col gap-8">
        <Section id="scope" title="1. What this page covers">
          <P>
            This page explains how to ask {metaData.name} to delete personal
            data associated with:
          </P>
          <List>
            <li>
              <Term>This website</Term> &mdash; {metaData.title}, including the
              blog and links page.
            </li>
            <li>
              <Term>Apps and services I publish under my own name</Term>{" "}
              &mdash; including any application that uses OAuth to connect to
              Meta, Google, or similar platforms.
            </li>
            <li>
              <Term>Apps, integrations and automations I built for clients</Term>{" "}
              &mdash; where I act as a processor on behalf of the client, who
              is the controller of the data.
            </li>
          </List>
          <P>
            For a fuller picture of what data is processed and why, see the{" "}
            <Link
              href="/policy"
              className="no-underline hover:underline underline-offset-4 text-black dark:text-white"
            >
              Privacy Policy
            </Link>
            .
          </P>
        </Section>

        <Section id="how" title="2. How to request deletion">
          <P>
            Send an email to <Mail /> with the following:
          </P>
          <OL>
            <li>
              <Term>Subject:</Term> &ldquo;Data deletion request&rdquo;.
            </li>
            <li>
              <Term>The app or service</Term> where your data lives (for
              example, the name of the app, the URL, or the integration you
              used).
            </li>
            <li>
              <Term>Identifiers</Term> I can use to find your data: the email
              address, username, phone number or account you signed in with.
              If you connected via a third-party login (Meta, Google, etc.),
              tell me which provider.
            </li>
            <li>
              <Term>Scope</Term>: whether you want everything deleted, or only
              a specific dataset.
            </li>
          </OL>
          <P>
            Please send the request from the email address associated with the
            account when possible, so I can verify the request without asking
            for additional identity documents.
          </P>
        </Section>

        <Section id="revoke" title="3. Revoke access first (recommended)">
          <P>
            If you connected an app of mine to a third-party account, you can
            revoke its access directly at the provider. This immediately stops
            any further processing on that account:
          </P>
          <List>
            <li>
              <Term>Meta / Facebook / Instagram:</Term>{" "}
              <Out href="https://accountscenter.facebook.com/apps_and_websites">
                accountscenter.facebook.com/apps_and_websites
              </Out>
            </li>
            <li>
              <Term>Google:</Term>{" "}
              <Out href="https://myaccount.google.com/permissions">
                myaccount.google.com/permissions
              </Out>
            </li>
            <li>
              <Term>WhatsApp Business / Cloud API:</Term> revoke from the
              connected Meta Business account above.
            </li>
            <li>
              <Term>Slack, Notion, GitHub and similar:</Term> from{" "}
              <em>Settings &rarr; Connected apps</em> or{" "}
              <em>Authorized applications</em> in the provider&rsquo;s account
              settings.
            </li>
          </List>
          <P>
            Revoking access stops future data flow but does not delete data
            already stored. To delete that data, send the email described in
            section 2.
          </P>
        </Section>

        <Section id="timeline" title="4. Timeline and confirmation">
          <List>
            <li>
              <Term>Within 7 days</Term> &mdash; I will acknowledge your
              request and let you know if I need anything else to identify
              your records.
            </li>
            <li>
              <Term>Within 30 days</Term> &mdash; I will delete the data I
              control, and confirm by email when it is done.
            </li>
            <li>
              <Term>Client-owned systems</Term> &mdash; where I am a processor,
              I will forward the request to the controller and help them
              action it. Their own response time applies.
            </li>
          </List>
        </Section>

        <Section id="exceptions" title="5. What may be retained">
          <P>
            Some data may be kept after your request, only where the law
            requires or clearly permits it:
          </P>
          <List>
            <li>
              <Term>Invoices and tax records</Term> &mdash; kept for the
              retention period required by Argentine tax and accounting law.
            </li>
            <li>
              <Term>Aggregate and anonymous data</Term> &mdash; counters and
              analytics that no longer identify you are kept as statistics.
            </li>
            <li>
              <Term>Security and abuse records</Term> &mdash; the minimum
              needed to defend legal claims or investigate security incidents.
            </li>
            <li>
              <Term>Backups</Term> &mdash; data may persist in encrypted
              backups until they rotate out on their normal schedule, and will
              not be restored into active systems.
            </li>
          </List>
        </Section>

        <Section id="contact" title="6. Contact">
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
            <br />
            Related:{" "}
            <Link
              href="/policy"
              className="no-underline hover:underline underline-offset-4 text-black dark:text-white"
            >
              Privacy Policy
            </Link>
            {" "}&middot;{" "}
            <Link
              href="/terms"
              className="no-underline hover:underline underline-offset-4 text-black dark:text-white"
            >
              Terms
            </Link>
          </P>
        </Section>
      </div>
    </article>
  );
}
