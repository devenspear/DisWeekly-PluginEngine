import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disruption Weekly - Processing Engine",
  description: "Backend API for Disruption Weekly URL Writer workflow",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
