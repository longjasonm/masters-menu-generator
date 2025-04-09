import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sourceSerif4 = Source_Serif_4({
  variable: "--font-source-serif-4",
  subsets: ["latin"],
});

export const metadata = {
  title: "Masters Menu Generator",
  description: "A web application that allows users to create, customize, and share a Masters Tournament-inspired dinner menu. NOT AFFILIATED WITH THE MASTERS TOURNAMENT OR AUGUSTA NATIONAL GOLF CLUB.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${sourceSerif4.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
