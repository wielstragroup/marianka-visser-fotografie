"use client";

// Catches errors thrown by the root layout itself (e.g. if metadata
// generation fails) — error.tsx alone can't, since it renders inside the
// root layout. This has to render its own <html>/<body> since it replaces
// the root layout entirely, so it intentionally doesn't share the site's
// design system components (which depend on that layout being intact).
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="nl">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          background: "#faf5ee",
          color: "#33291f",
          fontFamily: "Georgia, serif",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 500, marginBottom: "12px" }}>Even iets misgegaan</h1>
          <p style={{ marginBottom: "24px", color: "#5c4f42" }}>
            De website kon niet worden geladen. Probeer het opnieuw.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              background: "#33291f",
              color: "#faf5ee",
              border: "none",
              borderRadius: "999px",
              padding: "12px 28px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Probeer opnieuw
          </button>
        </div>
      </body>
    </html>
  );
}
