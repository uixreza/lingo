export function toPersianDigits(n: string) {
  return n.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)]);
}

export function formatDate(dateStr: string) {
  return toPersianDigits(dateStr.split("/").join(" / "));
}

export function estimateMinutes(html: string) {
  const words = html
    .replace(/<[^>]*>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export type TocHeading = {
  id: string;
  text: string;
  level: number;
};

export function processContent(html: string): {
  headings: TocHeading[];
  intro: string | null;
  sections: string[];
} {
  const headings: TocHeading[] = [];
  let counter = 0;

  const withIds = html.replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/g,
    (_match, tag: string, attrs: string, inner: string) => {
      counter += 1;
      const id = `sec-${counter}`;
      const text = inner
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim();
      headings.push({ id, text, level: Number(tag) });
      return `<h${tag}${attrs} id="${id}">${inner}</h${tag}>`;
    },
  );

  const blocks = withIds
    .split(/(?=<h2[\s>])/)
    .map((block) => block.trim())
    .filter(Boolean);

  const intro =
    blocks.length > 0 && !blocks[0].startsWith("<h2") ? blocks[0] : null;
  const sections = intro ? blocks.slice(1) : blocks;

  return { headings, intro, sections };
}
