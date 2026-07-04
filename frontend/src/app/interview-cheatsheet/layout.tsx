// Metadata and FAQ structured data are handled in page.tsx.
// This layout exists only as a segment wrapper.
export default function CheatsheetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
