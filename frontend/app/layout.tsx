import "./globals.css";

export const metadata = {
  title: "PortfolioPath",
  description: "Guided investing education, portfolio simulation, and beginner-friendly research."
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return (
    <html lang="en">
      <body>
        <a className="skipLink" href="#main-content">Skip to main content</a>
        <div className="appShell">
          <aside className="appRail" aria-label="Primary navigation">
            <a className="railMark" href="/" aria-label="PortfolioPath home">P</a>
            <nav className="railNav">
              <a className="railLink" href="/dashboard" title="My Portfolios"><span>⌂</span><span className="railLabel">Portfolios</span></a>
              <a className="railLink" href="/learn" title="Learn"><span>◫</span><span className="railLabel">Learn</span></a>
              <a className="railLink" href="/profile" title="Profile"><span>○</span><span className="railLabel">Profile</span></a>
            </nav>
            <div className="railBottom">
              <a className="railLink" href="/disclosures" title="Disclosures"><span>?</span><span className="railLabel">Disclosures</span></a>
            </div>
          </aside>
          <div className="appWorkspace">
            <header className="appTopbar" role="banner">
              <div className="topBrand"><a href="/">PortfolioPath</a><span>/ Learning Workspace</span></div>
              <nav className="topActions" aria-label="Utility navigation">
                <a href="/learn">Research & Learn</a>
                <a className="profileChip" href="/profile">Profile</a>
              </nav>
            </header>
            <main id="main-content" className="appMain">
              {children}
              <footer className="siteFooter">
                <p className="educationalNotice"><strong>For learning only.</strong> PortfolioPath is an investing education and simulation tool. Its model allocations, research examples, observations, and educational information are not personalized investment advice or instructions to trade.</p>
                <div className="footerLinks" aria-label="Footer navigation">
                  <a href="/disclosures">Disclosures</a>
                  <a href="/privacy">Privacy</a>
                  <a href="/terms">Terms</a>
                </div>
              </footer>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
