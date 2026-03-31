"use client";

// Lightweight markdown renderer — no heavy deps
// Handles: headings, bold, italic, code, code blocks, lists, links, horizontal rules

function escape(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderInline(text: string): string {
  return text
    .replace(
      /`([^`]+)`/g,
      '<code class="rounded bg-gray-800 px-1.5 py-0.5 text-xs font-mono text-violet-300">$1</code>',
    )
    .replace(
      /\*\*([^*]+)\*\*/g,
      '<strong class="font-semibold text-gray-100">$1</strong>',
    )
    .replace(/\*([^*]+)\*/g, '<em class="italic text-gray-300">$1</em>')
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-violet-400 underline hover:text-violet-300">$1</a>',
    );
}

function renderMarkdown(md: string): string {
  const lines = md.split("\n");
  const html: string[] = [];
  let inCode = false;
  let codeLines: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block
    if (line.startsWith("```")) {
      if (inCode) {
        html.push(
          `<pre class="rounded-xl bg-gray-800 border border-gray-700 p-4 text-xs font-mono text-gray-300 overflow-x-auto my-3"><code>${escape(codeLines.join("\n"))}</code></pre>`,
        );
        codeLines = [];
        inCode = false;
      } else {
        if (inList) {
          html.push("</ul>");
          inList = false;
        }
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      codeLines.push(line);
      continue;
    }

    // Close list if needed
    if (inList && !line.match(/^[-*+]\s/)) {
      html.push("</ul>");
      inList = false;
    }

    // Blank line
    if (line.trim() === "") {
      html.push('<div class="h-3"></div>');
      continue;
    }

    // Headings
    const h3 = line.match(/^### (.+)/);
    const h2 = line.match(/^## (.+)/);
    const h1 = line.match(/^# (.+)/);
    if (h1) {
      html.push(
        `<h1 class="text-lg font-semibold text-gray-100 mt-4 mb-2">${renderInline(h1[1])}</h1>`,
      );
      continue;
    }
    if (h2) {
      html.push(
        `<h2 class="text-base font-semibold text-gray-200 mt-4 mb-2">${renderInline(h2[1])}</h2>`,
      );
      continue;
    }
    if (h3) {
      html.push(
        `<h3 class="text-sm font-semibold text-gray-300 mt-3 mb-1">${renderInline(h3[1])}</h3>`,
      );
      continue;
    }

    // HR
    if (line.match(/^---+$/)) {
      html.push('<hr class="border-gray-800 my-4" />');
      continue;
    }

    // List item
    const listMatch = line.match(/^[-*+]\s(.+)/);
    if (listMatch) {
      if (!inList) {
        html.push(
          '<ul class="space-y-1 my-2 ml-4 list-disc list-outside text-gray-300 text-sm">',
        );
        inList = true;
      }
      html.push(`<li>${renderInline(listMatch[1])}</li>`);
      continue;
    }

    // Numbered list
    const numMatch = line.match(/^\d+\.\s(.+)/);
    if (numMatch) {
      html.push(
        `<p class="text-sm text-gray-300 my-0.5 ml-4">${renderInline(line)}</p>`,
      );
      continue;
    }

    // Paragraph
    html.push(
      `<p class="text-sm text-gray-300 leading-relaxed">${renderInline(line)}</p>`,
    );
  }

  if (inList) html.push("</ul>");
  if (inCode)
    html.push(
      `<pre class="rounded-xl bg-gray-800 p-4 text-xs font-mono text-gray-300">${escape(codeLines.join("\n"))}</pre>`,
    );

  return html.join("\n");
}

export default function MarkdownViewer({ content }: { content: string }) {
  return (
    <div
      className="prose-custom max-w-none"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
}
