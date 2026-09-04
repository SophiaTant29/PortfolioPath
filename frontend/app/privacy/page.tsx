export default function PrivacyPage(){
  return <section className="panel">
    <p className="sectionEyebrow">Privacy</p>
    <h1>Privacy Notice</h1>
    <p><strong>Effective September 4, 2026.</strong> This notice explains the information PortfolioPath uses to provide its investing-education and portfolio-simulation service.</p>
    <h2>Information you provide</h2>
    <p>When you create an account or use PortfolioPath, you may provide an email address, questionnaire responses, learning-portfolio names, simulated investment amounts, selected securities, and other information you choose to save.</p>
    <h2>How the information is used</h2>
    <p>PortfolioPath uses account and portfolio information to authenticate users, save progress, generate educational model allocations, display portfolio-structure analysis, and operate and improve the service.</p>
    <h2>Service providers</h2>
    <p>PortfolioPath uses service providers to operate the application, including Supabase for authentication and database services, Vercel for the web application, Render for backend hosting, and market-data or research providers used by the analytics service. Those providers process information as necessary to provide their services.</p>
    <h2>Market-data requests</h2>
    <p>Market-data and research requests are sent through the PortfolioPath backend. Provider API credentials are kept server-side and are not intended to be exposed to browser clients.</p>
    <h2>Security</h2>
    <p>PortfolioPath uses authenticated accounts and database Row Level Security policies designed to restrict user-owned portfolio records to the appropriate user. No internet service can guarantee absolute security.</p>
    <h2>Retention and deletion</h2>
    <p>Account and saved portfolio information may remain stored while an account is active or as needed to operate, secure, and maintain the service. Account-deletion and data-request procedures should be handled through the support contact published by PortfolioPath.</p>
    <h2>Children</h2>
    <p>PortfolioPath is not directed to children under 13 and is intended for users who are able to understand an investing-education simulation.</p>
    <h2>Changes</h2>
    <p>This notice may be updated as PortfolioPath changes. Material updates should be reflected by a new effective date on this page.</p>
  </section>;
}
