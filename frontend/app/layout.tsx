import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { ToastContainer } from '@/components/Toast';

export const metadata: Metadata = {
  title: 'Auraya Studio - Modern E-Commerce',
  description: 'Your one-stop shop for premium products',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Navbar />
        <main>{children}</main>
        <ToastContainer />
      </body>
    </html>
  );
}
