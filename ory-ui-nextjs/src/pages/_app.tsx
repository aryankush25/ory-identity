import { Fragment } from "react";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import { IntlProvider, ThemeProvider } from "@ory/elements";

import "@/styles/globals.css";
import "@ory/elements/style.css";

const myFont = Inter({
  style: ["normal"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Fragment>
      <style jsx global>{`
        html {
          font-family: ${myFont.style.fontFamily};
        }
      `}</style>
      <ThemeProvider>
        <IntlProvider>
          <Component {...pageProps} />
        </IntlProvider>
      </ThemeProvider>
    </Fragment>
  );
}
