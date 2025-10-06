import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FoodShare Manager - Quản lý cửa hàng thực phẩm",
  description: "Hệ thống quản lý cửa hàng thực phẩm. Quản lý sản phẩm, đơn hàng và cửa hàng một cách hiệu quả.",
  keywords: ["foodshare", "quản lý cửa hàng", "thực phẩm", "restaurant management", "food delivery"],
  authors: [{ name: "FoodShare Team" }],
  creator: "FoodShare",
  publisher: "FoodShare",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://foodshare-manager.vercel.app"),
  openGraph: {
    title: "FoodShare Manager - Quản lý cửa hàng thực phẩm",
    description: "Hệ thống quản lý cửa hàng thực phẩm",
    url: "https://foodshare-manager.vercel.app",
    siteName: "FoodShare Manager",
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FoodShare Manager - Quản lý cửa hàng thực phẩm",
    description: "Hệ thống quản lý cửa hàng thực phẩm",
  },
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
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
