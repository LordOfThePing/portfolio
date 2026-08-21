import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renders a post's Markdown body with GitHub-flavored extensions (tables,
 * strikethrough, task lists, autolinks).
 *
 * react-markdown NEVER injects raw HTML as-is (it escapes it), so untrusted
 * prose is safe without an extra sanitizer — the author's Markdown becomes text
 * and semantic <Markdown> nodes, not arbitrary <script>/<iframe> tags.
 *
 * Styling comes from @tailwindcss/typography via the "prose" class in global.css.
 */
export default function Markdown({ source }: { source: string }) {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none [&>*:first-child]:mt-0">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{source}</ReactMarkdown>
    </div>
  );
}
