"use client";
import dynamic from "next/dynamic";

// The whole legacy SPA runs client-side (BrowserRouter, xyflow, GrapesJS).
const SpaApp = dynamic(() => import("@/spa/SpaApp"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      Loading…
    </div>
  ),
});

export default function CatchAllPage() {
  return <SpaApp />;
}
