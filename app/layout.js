import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "Vetted",
  description:
    "Track KOL calls, auto-validate on-chain risk, and watch smart money — all in one dashboard.",
  icons: {
    icon: "/logo-1.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
