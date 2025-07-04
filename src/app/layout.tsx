import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import {
  Facebook,
  Instagram,
  Linkedin,
  Send,
  Twitter,
  Youtube,
} from "lucide-react";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Trade-Pro",
  description: "Generated by create next app",
};
const Footer = () => (
  <div className="bg-black text-white py-8">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <p className="text-sm mb-2">ABCD Tech Park,3rd Floor</p>
          <p className="text-sm mb-2">Abch Road,Banglore</p>
          <p className="text-sm mb-2">Banglore-560103</p>
          <p className="text-sm mb-2">
            <a href="" className="text-blue-500 hover:underline">
              Contact Us
            </a>
          </p>
          <div className="flex space-x-4">
            <Facebook
              className="text-gray-400 hover:text-blue-500 cursor-pointer"
              size={20}
            />
            <Twitter
              className="text-gray-400 hover:text-blue-500 cursor-pointer"
              size={20}
            />
            <Youtube
              className="text-gray-400 hover:text-blue-500 cursor-pointer"
              size={20}
            />
            <Instagram
              className="text-gray-400 hover:text-blue-500 cursor-pointer"
              size={20}
            />
            <Linkedin
              className="text-gray-400 hover:text-blue-500 cursor-pointer"
              size={20}
            />
            <Send
              className="text-gray-400 hover:text-blue-500 cursor-pointer"
              size={20}
            />
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-4 ">Products</h3>
          <ul className="space-y-2">
            {["Stocks", "Futures & Options", "IPO", "Mutal Funds"].map(
              (item) => (
                <li
                  className="text-sm hover:text-blue-500 cursor-pointer"
                  key={item}
                >
                  {item}
                </li>
              )
            )}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-4 ">Products</h3>
          <ul className="space-y-2">
            {["About Us", "Pricing", "Blog", "Carrer", "Help and Support"].map(
              (item) => (
                <li
                  className="text-sm hover:text-blue-500 cursor-pointer"
                  key={item}
                >
                  {item}
                </li>
              )
            )}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-4 ">Products</h3>
          <ul className="space-y-2">
            {[
              "Amc Mutual Funds",
              "Calculators",
              "Glossary",
              "Tradepro Digest",
              "Help and Support",
            ].map((item) => (
              <li
                className="text-sm hover:text-blue-500 cursor-pointer"
                key={item}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-8 pt-8 border-gray-200 flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm text-gray-500 mb-4 mdLmb-0">
          {" "}
          © 2016-2024 TradePro. All rights reserved, Built with ❤️ in India
        </p>
      </div>
    </div>
  </div>
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        
        {children}
        <Footer />
      </body>
    </html>
  );
}
