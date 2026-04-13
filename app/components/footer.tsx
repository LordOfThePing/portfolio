import { metaData } from "app/config";

const YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="text-[#1C1C1C] dark:text-[#D4D4D4]">
      <div className="h-px w-full bg-black/10 dark:bg-white/10 mb-6" />

      <small className="block">
        <time>© {YEAR}</time>{" "}
        <a
          className="no-underline hover:underline underline-offset-4"
          href={metaData.baseUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {metaData.title}
        </a>
      </small>
    </footer>
  );
}
