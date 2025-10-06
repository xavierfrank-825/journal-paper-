// src/components/ReferencesListPerLine.jsx
import React from "react";
import DOMPurify from "dompurify";
import "./ReferencesList.css"; // reuse previous CSS or tweak

const doiRegex = /\b10\.\d{4,9}\/[^\s"'<>()\]]+/g;
const urlRegex = /(https?:\/\/[^\s"'<>()\]]+)/g;

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function linkifyLine(line) {
  let html = escapeHtml(line);

  html = html.replace(doiRegex, (match) => {
    const href = `https://doi.org/${match}`;
    return `<a href="${href}" target="_blank" rel="noopener noreferrer">${match}</a>`;
  });

  html = html.replace(urlRegex, (match) => {
    return `<a href="${match}" target="_blank" rel="noopener noreferrer">${match}</a>`;
  });

  // allow <a> only; no <br> here since each line is separate
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["a"],
    ALLOWED_ATTR: ["href", "target", "rel"],
  });
}

export default function ReferencesListPerLine({ references }) {
  const text = Array.isArray(references) ? references.join("\n") : (references || "");
  const lines = text.split(/\r\n|\r|\n/).map(l => l.trim()).filter(l => l.length > 0);

  return (
    <div className="refs-box">
      {lines.map((line, i) => (
        <p key={i} style={{ margin: "6px 0" }}>
          <span dangerouslySetInnerHTML={{ __html: linkifyLine(line) }} />
        </p>
      ))}
    </div>
  );
}
