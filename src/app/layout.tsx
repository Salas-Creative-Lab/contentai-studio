import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3b82f6" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "ContentAI Studio - Generación de Contenido con IA",
    template: "%s | ContentAI Studio",
  },
  description: "Plataforma multi-cliente de generación de contenido visual con IA. Crea imágenes, textos y reels automáticamente para redes sociales y e-commerce.",
  keywords: [
    "IA",
    "Inteligencia Artificial",
    "Generación de Contenido",
    "Marketing",
    "Redes Sociales",
    "E-commerce",
    "Automatización",
    "Diseño",
    "ContentAI",
  ],
  authors: [{ name: "ContentAI Studio" }],
  creator: "ContentAI Studio",
  publisher: "ContentAI Studio",
  applicationName: "ContentAI Studio",

  // PWA Configuration
  manifest: "/manifest.json",

  // Icons
  icons: {
    icon: [
      { url: "/icons/icon-72x72.png", sizes: "72x72", type: "image/png" },
      { url: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-128x128.png", sizes: "128x128", type: "image/png" },
      { url: "/icons/icon-144x144.png", sizes: "144x144", type: "image/png" },
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-384x384.png", sizes: "384x384", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/icons/icon-96x96.png",
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },

  // Apple PWA Meta Tags
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ContentAI Studio",
  },

  // Open Graph
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://contentai.studio",
    siteName: "ContentAI Studio",
    title: "ContentAI Studio - Generación de Contenido con IA",
    description: "Plataforma multi-cliente de generación de contenido visual con IA. Crea imágenes, textos y reels automáticamente.",
    images: [
      {
        url: "/icons/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "ContentAI Studio Logo",
      },
    ],
  },

  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "ContentAI Studio",
    description: "Generación de contenido con IA para marketing y e-commerce",
    images: ["/icons/icon-512x512.png"],
  },

  // Format Detection
  formatDetection: {
    telephone: false,
    date: true,
    address: false,
    email: false,
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Categories
  category: "productivity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* PWA Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ContentAI" />
        <meta name="application-name" content="ContentAI Studio" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="msapplication-config" content="/browserconfig.xml" />

        {/* Theme */}
        <meta name="color-scheme" content="dark light" />
        <meta name="prefers-color-scheme" content="dark" />

        {/* Security */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

        {/* Preconnect to Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registrado exitosamente:', registration.scope);
                    })
                    .catch(function(error) {
                      console.log('SW registro fallido:', error);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
