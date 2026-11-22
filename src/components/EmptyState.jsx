// Shown when there is nothing to list yet. Always offers a next step.
// page=true when it is the whole page (not found), so the title is the page's h1.
export default function EmptyState({ title, text, page = false, children }) {
  const Heading = page ? 'h1' : 'h2';
  return (
    <div className="empty">
      <svg className="empty-art" viewBox="0 0 120 90" aria-hidden="true">
        <rect x="18" y="10" width="70" height="72" rx="10" className="empty-paper" />
        <rect x="30" y="26" width="38" height="6" rx="3" className="empty-line" />
        <rect x="30" y="40" width="46" height="6" rx="3" className="empty-line" />
        <rect x="30" y="54" width="28" height="6" rx="3" className="empty-line" />
        <circle cx="90" cy="64" r="16" className="empty-badge" />
        <path d="M83 64l5 5 9-10" className="empty-check" />
      </svg>
      {title && <Heading>{title}</Heading>}
      {text && <p>{text}</p>}
      {children}
    </div>
  );
}
