import { Lato } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import LayoutContent from "./client/LayoutContent";

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["100", "300" ,"400", "700", "900"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>CloudBook | Retail Business Management Software</title>
      </head>
      <body
        className={`${lato.variable} antialiased bg-[#F2F4F7] text-gray-900`}
      >
        <AuthProvider>
          <LayoutContent>{children}</LayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}
