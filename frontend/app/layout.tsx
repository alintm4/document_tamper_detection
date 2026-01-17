import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Proofly - Image Authenticity Checker',
  description: 'Verify if images are authentic or manipulated',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white">
        {children}
      </body>
    </html>
  );
}
