import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains',
});

export const metadata = {
  title: 'Nishant Singh — Senior Software Engineer | Full-Stack & Mobile',
  description:
    'Portfolio of Nishant Singh — Senior Software Engineer specializing in modern full-stack web applications (React.js, Next.js, Node.js), cross-platform mobile apps (Flutter, React Expo), and custom Shopify e-commerce.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
