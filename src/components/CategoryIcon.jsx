// A simple line icon for each career field.
const PATHS = {
  'Software Development': 'M8 8 3 12l5 4M16 8l5 4-5 4M14 5l-4 14',
  'Information Technology': 'M3 5h18v11H3zM8 20h8M12 16v4',
  Cybersecurity: 'M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6zM9 12l2 2 4-4',
  'Data Analysis': 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  'Project Management': 'M4 21V4M4 4h12l-2 4 2 4H4',
  'Business Communication': 'M4 5h16v11H9l-5 4z',
};

export default function CategoryIcon({ category }) {
  const d = PATHS[category] || 'M12 4v16M4 12h16';
  return (
    <svg className="cat-icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
