// Metadata and FAQ structured data are handled in page.tsx.
// This layout exists only as a segment wrapper.
// skipcq: JS-0067
export default function CheatsheetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
