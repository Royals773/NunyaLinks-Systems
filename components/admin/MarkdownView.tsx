import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

// Minimal hast types — enough to walk text nodes without extra packages.
type HastNode = {
  type: string;
  value?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

const PLACEHOLDER = /(\[[^\]\n]{2,160}\]|\{\{\s*[a-z_.]+\s*\}\})/g;

/** Wraps unfilled [notes] and {{placeholders}} in <mark> so they stand out. */
function rehypeMarkPlaceholders() {
  return (tree: HastNode) => {
    const walk = (node: HastNode) => {
      if (!node.children) return;
      const next: HastNode[] = [];
      for (const child of node.children) {
        if (child.type === "text" && child.value && PLACEHOLDER.test(child.value)) {
          PLACEHOLDER.lastIndex = 0;
          for (const part of child.value.split(PLACEHOLDER)) {
            if (!part) continue;
            if (/^(\[[^\]\n]{2,160}\]|\{\{\s*[a-z_.]+\s*\}\})$/.test(part)) {
              next.push({
                type: "element",
                tagName: "mark",
                properties: { className: ["doc-placeholder"] },
                children: [{ type: "text", value: part }],
              });
            } else {
              next.push({ type: "text", value: part });
            }
          }
        } else {
          if (child.tagName !== "code" && child.tagName !== "pre") walk(child);
          next.push(child);
        }
      }
      node.children = next;
    };
    walk(tree);
  };
}

const components: Components = {
  h1: ({ children }) => (
    <h1 className="font-display mb-6 border-b-2 border-accent pb-3 text-3xl font-semibold tracking-tight text-ink">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-display mt-8 mb-3 break-after-avoid text-xl font-semibold text-navy">{children}</h2>
  ),
  h3: ({ children }) => <h3 className="mt-5 mb-2 break-after-avoid text-base font-semibold text-ink">{children}</h3>,
  p: ({ children }) => <p className="my-3 text-[15px] leading-relaxed text-slate-800">{children}</p>,
  ul: ({ children }) => <ul className="my-3 list-disc space-y-1.5 pl-6 text-[15px] leading-relaxed text-slate-800">{children}</ul>,
  ol: ({ children }) => <ol className="my-3 list-decimal space-y-1.5 pl-6 text-[15px] leading-relaxed text-slate-800">{children}</ol>,
  strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
  a: ({ children, href }) => (
    <a href={href} className="text-navy underline" target="_blank" rel="noopener noreferrer">{children}</a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-4 border-l-4 border-accent-light bg-slate-50 px-4 py-2 text-slate-700">{children}</blockquote>
  ),
  hr: () => <hr className="my-8 border-slate-200 print:break-after-page print:border-0" />,
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto break-inside-avoid">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-ink text-white">{children}</thead>,
  th: ({ children, style }) => (
    <th style={style} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide">{children}</th>
  ),
  td: ({ children, style }) => (
    <td style={style} className="border-b border-slate-200 px-3 py-2 align-top text-slate-800">{children}</td>
  ),
  code: ({ children }) => <code className="rounded bg-slate-100 px-1 py-0.5 text-[13px]">{children}</code>,
};

export default function MarkdownView({ body }: { body: string }) {
  return (
    <div className="doc-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeMarkPlaceholders]} components={components}>
        {body}
      </ReactMarkdown>
    </div>
  );
}
