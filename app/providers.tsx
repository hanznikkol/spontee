'use client'

import { APIProvider } from "@vis.gl/react-google-maps";
import { ThemeProvider } from "next-themes";

export function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!} libraries={["places", "marker", "geocoding"]}>
        {children}
      </APIProvider>
    </ThemeProvider>
  );
}
