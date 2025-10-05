import "./globals.css";

export const metadata = {
  title: "GoFed Product Finder",
  description: "Search commercial interiors products with AI assistance",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.cdnfonts.com/css/futura-pt" rel="stylesheet" />
      </head>
      <body className='antialiased font-["Futura PT",_sans-serif] bg-white text-[#1a1a1a]'>
        {children}
      </body>
    </html>
  );
}
