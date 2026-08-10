import LegalPage from "@/components/common/LegalPage";

export default function Terms() {
  return (
    <LegalPage
      title="Terms & Conditions"
      subtitle="Please read these terms carefully before using PARYAJ 888. By registering an account or placing any bet, you confirm that you accept and agree to be bound by these terms."
      lastUpdated="August 1, 2026"
      sections={[
        {
          heading: "Acceptance of Terms",
          body: "These Terms & Conditions govern your access to and use of the PARYAJ 888 sportsbook and casino platform (the 'Service'). By creating an account, logging in, or placing a wager, you acknowledge that you have read, understood, and agreed to these Terms. If you do not agree, you must not use the Service.",
        },
        {
          heading: "Eligibility",
          body: "You must be of legal gambling age in your jurisdiction (18 years or older, or 21 where required) to register and play. It is your responsibility to ensure that online gambling is legal in your country or region before using the Service.",
          list: [
            "You must provide accurate and truthful information at registration.",
            "You may only hold one account. Duplicate accounts may be closed and balances forfeited.",
            "Employees, contractors, and their immediate families may not open a player account.",
            "You are responsible for keeping your login credentials secure and confidential.",
          ],
        },
        {
          heading: "Account & Verification",
          body: "You must complete identity verification (KYC) before withdrawing funds. We may request government-issued ID, proof of address, and proof of payment method ownership. Failure to provide requested documentation may result in account suspension and withholding of balances.",
        },
        {
          heading: "Betting & Wagering",
          body: "All bets are subject to our Sports Rules and general betting rules. Odds displayed at the time of bet placement are the odds applied to your wager; the backend re-validates odds before a bet is accepted. If odds have changed, the bet is rejected and no stake is deducted.",
          list: [
            "Bets are accepted on the basis that the event remains open for betting.",
            "We reserve the right to void any bet placed on an event that is later determined to be compromised or irregular.",
            "Maximum payouts per event and per market may apply and are published in Sports Rules.",
            "PARYAJ 888 does not guarantee uninterrupted odds availability for any market.",
          ],
        },
        {
          heading: "Deposits & Withdrawals",
          body: "You may deposit funds using the payment methods available in your region. Withdrawals are processed to the same method used for deposit where possible. Withdrawal requests may be subject to verification, review, and processing times.",
          list: [
            "Minimum and maximum deposit and withdrawal limits apply per method.",
            "Bonus funds may carry wagering requirements before withdrawal is permitted.",
            "We may delay or refuse a withdrawal where fraud, bonus abuse, or suspicious activity is suspected.",
            "Pending withdrawal requests may be cancelled only before they enter processing.",
          ],
        },
        {
          heading: "Bonuses & Promotions",
          body: "Bonuses and promotional offers are subject to specific terms published with each offer. We reserve the right to modify, suspend, or cancel promotions at any time. Bonus abuse, including coordinated play or low-risk exploitation, may result in forfeiture of bonuses and winnings.",
        },
        {
          heading: "Prohibited Conduct",
          list: [
            "Use of bots, scripts, or automated tools to place bets is prohibited.",
            "Match-fixing, insider betting, or betting on events you can influence is strictly forbidden.",
            "Funding an account with proceeds of unlawful activity is prohibited.",
            "Sharing accounts or transferring balances between users is not permitted.",
          ],
        },
        {
          heading: "Liability",
          body: "The Service is provided on an 'as is' basis. To the maximum extent permitted by law, PARYAJ 888 shall not be liable for indirect, incidental, or consequential losses arising from your use of the Service, including losses caused by technical failures, provider outages, or force majeure events.",
        },
        {
          heading: "Account Closure & Termination",
          body: "You may close your account at any time by contacting Support, provided all withdrawals are settled. We may suspend or close your account at our discretion, including for breach of these Terms, suspected fraud, or at the request of a regulator.",
        },
        {
          heading: "Changes to These Terms",
          body: "We may update these Terms from time to time. Material changes will be communicated through the platform or by email. Continued use of the Service after changes take effect constitutes acceptance of the revised Terms.",
        },
        {
          heading: "Governing Law",
          body: "These Terms are governed by the laws of the jurisdiction in which PARYAJ 888 is licensed. Any disputes shall be resolved in accordance with those laws and the dispute resolution procedures published by the relevant licensing authority.",
        },
      ]}
    />
  );
}