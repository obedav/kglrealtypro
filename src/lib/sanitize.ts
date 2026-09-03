import sanitizeHtml from "sanitize-html";

// Explicit tag list — no "*" wildcard to prevent unknown element injection.
const ALLOWED_TAGS = [
  "h2", "h3", "h4", "p", "br", "hr", "blockquote", "pre", "code",
  "ul", "ol", "li", "dl", "dt", "dd",
  "strong", "b", "em", "i", "u", "s", "mark", "sub", "sup", "span",
  "a", "img", "figure", "figcaption",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption",
];

// class is allowed only on layout/prose containers — not on every element.
const LAYOUT_TAGS = ["p", "span", "figure", "figcaption", "blockquote",
  "ul", "ol", "li", "table", "thead", "tbody", "tr", "th", "td"];

const ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions["allowedAttributes"] = {
  a: ["href", "title", "rel", "target"],
  img: ["src", "alt", "width", "height", "loading"],
  ...Object.fromEntries(LAYOUT_TAGS.map((tag) => [tag, ["class"]])),
};

export function sanitizeListingHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    // data: and javascript: URIs are implicitly blocked by omitting them here.
    allowedSchemes: ["https", "http", "mailto"],
    allowedSchemesByTag: {
      img: ["https"], // images must be HTTPS only
    },
  });
}
