import "./globals.css";

export const metadata = {
  title: "PortfolioPath",
  description: "Guided investing education, portfolio construction, and research."
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return (
    <html lang="en">
      <body>
        <a className="skipLink" href="#main-content">Skip to main content</a>
        <main id="main-content">
          <header className="navShell" role="banner">
            <a className="brand" href="/" aria-label="PortfolioPath home">PortfolioPath</a>
            <nav className="navLinks" aria-label="Primary navigation">
              <a className="btn btnSecondary" href="/">Home</a>
              <a className="btn btnSecondary" href="/dashboard">My Portfolios</a>
              <a className="btn btnSecondary" href="/learn">Learn</a>
              <a className="btn btnSecondary" href="/profile">Profile</a>
            </nav>
          </header>
          {children}
          <footer style={{marginTop:40,paddingTop:20,borderTop:"1px solid var(--line)"}}>
            <p className="educationalNotice"><strong>For learning only.</strong> PortfolioPath is an investing education and simulation tool. Its model allocations, rankings, alerts, and research information are educational and are not personalized investment advice or instructions to trade.</p>
            <div className="navLinks" aria-label="Footer navigation">
              <a href="/disclosures">Disclosures</a>
              <a href="/privacy">Privacy</a>
              <a href="/terms">Terms</a>
              <a href="/logout">Sign out</a>
            </div>
          </footer>
        </main>
      </body>
    </html>
  );
}
