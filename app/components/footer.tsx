import Link from "next/link";
import { metaData } from "app/config";

const YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="text-[#1C1C1C] dark:text-[#D4D4D4]">
      <div className="h-px w-full bg-black/10 dark:bg-white/10 mb-6" />

      <small className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span>
          <time>© {YEAR}</time>{" "}
          <a
            className="no-underline hover:underline underline-offset-4"
            href={metaData.baseUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {metaData.title}
          </a>
        </span>
        <Link
          className="no-underline hover:underline underline-offset-4"
          href="/policy"
        >
          Privacy
        </Link>
        <Link
          className="no-underline hover:underline underline-offset-4"
          href="/terms"
        >
          Terms
        </Link>
      </small>
    </footer>
  );
}
