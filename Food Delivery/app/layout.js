import { Inter } from "next/font/google";
import "./globals.css";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import Header from "./components/header";
// import {UserProvider} from "./context/userContext"
import "@uploadthing/react/styles.css";
import { ourFileRouter } from "../app/api/uploadthing/core";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <>
      <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
      <html lang="en">
        <body className={inter.className}>
          <Providers>
            {/* <UserProvider> */}
            <Header />
            <main>{children}</main>
            {/* </UserProvider> */}
          </Providers>
        </body>
      </html>
    </>
  );
}
