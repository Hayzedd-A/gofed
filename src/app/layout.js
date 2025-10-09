"use client";

import "./globals.css";
import { AuthProvider } from "./components/AuthContext";
import Nav from "./components/Nav";
import LoginModal from "./components/LoginModal";
import SignupModal from "./components/SignupModal";

// export const metadata = {
//   title: "MOODbrary Product Finder",
//   description: "Search commercial interiors products with AI assistance",
// };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.cdnfonts.com/css/futura-pt" rel="stylesheet" />
      </head>
      <body className='antialiased font-["Futura PT",_sans-serif] bg-white text-[#1a1a1a]'>
        <AuthProvider>
          <Nav />
          {children}
          <LoginModal />
          <SignupModal />
        </AuthProvider>
      </body>
    </html>
  );
}
