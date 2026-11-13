import type { Metadata } from "next";
import { Figtree, IBM_Plex_Sans_Arabic, Plus_Jakarta_Sans } from "next/font/google";
import { AppShell } from "@/components/shell/AppShell";
import { BRAND } from "@/styles/tokens";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-figtree",
  display: "swap",
});

const arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: BRAND.name,
  description: BRAND.tagline,
  applicationName: BRAND.name,
  icons: { icon: "/icons/icon-192.png", apple: "/icons/icon-192.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${jakarta.variable} ${figtree.variable} ${arabic.variable} h-full antialiased`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var s=JSON.parse(localStorage.getItem("deskdash-session")||"{}");var st=s.state&&s.state.state;if(st&&st.language==="ar"){document.documentElement.lang="ar";document.documentElement.dir="rtl";}if(st&&st.mode){document.documentElement.dataset.mode=st.mode;}if(sessionStorage.getItem("deskdash-splash")!=="1"){window.__deskdashShown=Date.now();setTimeout(function(){document.documentElement.classList.add("splash-done")},1600);}else{document.documentElement.classList.add("splash-done");}}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-dvh">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
