import "./globals.css";
export const metadata = {
  title: "SAHYOG — Connecting Needs. Creating Impact.",
  description: "SAHYOG is a community impact platform connecting food donors with NGOs and citizens with local community needs across Mumbai.",
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
