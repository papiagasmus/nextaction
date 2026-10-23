import { useEffect, useState } from "react";
import "./App.css";

type HealthPayload = { status: "ok"; service: "nextaction-worker" };
type ConnectionState = "checking" | "healthy" | "unavailable";

function isHealthPayload(value: unknown): value is HealthPayload {
  return typeof value === "object" && value !== null &&
    "status" in value && value.status === "ok" &&
    "service" in value && value.service === "nextaction-worker";
}

function App() {
  const [connectionState, setConnectionState] = useState<ConnectionState>("checking");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/health", {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Worker health request failed");
        const payload: unknown = await response.json();
        if (!isHealthPayload(payload)) throw new Error("Unexpected Worker health response");
        setConnectionState("healthy");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setConnectionState("unavailable");
      });
    return () => controller.abort();
  }, []);

  const statusCopy: Record<ConnectionState, string> = {
    checking: "Checking the application runtime…",
    healthy: "The application runtime is responding.",
    unavailable: "The Worker API did not respond. Check the local Worker server.",
  };

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="wordmark" href="/" aria-label="NextAction home">
          <span className="wordmark-mark" aria-hidden="true">N</span>
          <span>NextAction</span>
        </a>
        <span className="header-label">WORKFLOW-AWARE ADVERTISING</span>
      </header>
      <main className="main-content">
        <section className="hero" aria-labelledby="page-title">
          <p className="eyebrow">APPLICATION STATUS</p>
          <h1 id="page-title">One application. A clean foundation.</h1>
          <p className="hero-copy">
            The initial interface and Worker API run in one Cloudflare application.
            Product flows will be added in the approved development order.
          </p>
        </section>
        <section className={"status-card status-" + connectionState} aria-live="polite" aria-atomic="true">
          <div className="status-heading">
            <span className="status-dot" aria-hidden="true" />
            <h2>Worker API</h2>
          </div>
          <p>{statusCopy[connectionState]}</p>
          <code>GET /api/health</code>
        </section>
      </main>
      <footer className="site-footer">
        <span>One codebase</span><span aria-hidden="true">·</span>
        <span>One Worker</span><span aria-hidden="true">·</span>
        <span>One Supabase project</span>
      </footer>
    </div>
  );
}

export default App;
