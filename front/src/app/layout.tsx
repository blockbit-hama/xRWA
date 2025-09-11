import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ErrorBoundary from '@/components/ErrorBoundary';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'xStables - 스테이블코인 발행 플랫폼',
  description: 'DS 프로토콜 기반 스테이블코인 발행 서비스',
  keywords: ['stablecoin', 'blockchain', 'ethereum', 'defi', 'ds-protocol'],
  authors: [{ name: 'xStables Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}