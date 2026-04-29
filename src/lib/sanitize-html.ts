import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize document-template HTML before storing or rendering.
 *
 * Templates are authored by ADMIN users via a rich-text editor and rendered
 * inside parent-facing signing pages. If an admin account is ever compromised,
 * raw HTML/JS could be injected into those public pages — DOMPurify is our
 * line of defense.
 *
 * Allowlist matches what the template editor produces (basic typography,
 * tables, inline styles for layout). Scripts, event handlers, iframes,
 * and external resources are stripped.
 */
const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "u",
  "s",
  "code",
  "pre",
  "blockquote",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "a",
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "th",
  "td",
  "div",
  "span",
  "hr",
  "img",
];

const ALLOWED_ATTR = [
  "href",
  "title",
  "target",
  "rel",
  "src",
  "alt",
  "width",
  "height",
  "colspan",
  "rowspan",
  "class",
  "style",
];

export function sanitizeTemplateHtml(html: string | null | undefined): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // Strip <script>, <iframe>, <object>, <embed>, etc.
    FORBID_TAGS: ["script", "iframe", "object", "embed", "form", "input", "button"],
    // Strip event handlers (onclick, onerror, etc.) — these aren't in ALLOWED_ATTR
    // but DOMPurify also has explicit forbid list to be doubly sure.
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus"],
    // External-only protocols are blocked; data: URIs are allowed for
    // inline images (logos pasted into the editor).
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });
}
