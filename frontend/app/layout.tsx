import "./globals.css";

export const metadata = {
  title: "PortfolioPath",
  description: "Guided portfolio construction, investing education, and research."
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return (
    <html lang="en">
      <body>
        <a className="skipLink" href="#main-content">Skip to main content</a>
        <main id="main-content">
          <header className="navShell" role="banner">
            <a className="brand" href="/dashboard" aria-label="PortfolioPath dashboard">PortfolioPath</a>
            <nav className="navLinks" aria-label="Primary navigation">
              <a className="btn btnSecondary" href="/dashboard">Dashboard</a>
              <a className="btn btnSecondary" href="/profile">Profile</a>
              <a className="btn btnSecondary" href="/system-status">Status</a>
              <a className="btn btnSecondary" href="/logout">Sign out</a>
            </nav>
          </header>
          {children}
          <footer style={{marginTop:40,paddingTop:20,borderTop:"1px solid var(--line)"}}>
            <div className="navLinks" aria-label="Footer navigation">
              <a href="/disclosures">Disclosures</a>
              <a href="/privacy">Privacy</a>
              <a href="/terms">Terms</a>
              <a href="/system-status">System Status</a>
            </div>
            <p className="muted">PortfolioPath • Educational portfolio-building and research tools.</p>
          </footer>
        </main>
      </body>
    </html>
  );
}
