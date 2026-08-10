import LegalPage from "@/components/common/LegalPage";

export default function AmlKyc() {
  return (
    <LegalPage
      title="AML / KYC Policy"
      subtitle="PARYAJ 888 is committed to preventing money laundering and the financing of terrorism. This policy outlines our anti-money-laundering (AML) and know-your-customer (KYC) procedures."
      lastUpdated="August 1, 2026"
      sections={[
        {
          heading: "Overview",
          body: "As a regulated gambling operator, PARYAJ 888 is required by law to verify the identity of its customers, monitor transactions, and report suspicious activity. These obligations protect both you and the integrity of the platform.",
        },
        {
          heading: "KYC Verification",
          body: "All customers must complete identity verification before any withdrawal is processed. Verification may also be requested at registration, before large deposits, or at any time during the account lifecycle.",
          list: [
            "Proof of identity: a valid government-issued photo ID (passport, driver's license, or national ID).",
            "Proof of address: a utility bill or bank statement dated within the last 90 days.",
            "Proof of payment method: a screenshot or photo of the card or wallet used to deposit.",
            "Selfie verification may be required to match you to your ID document.",
          ],
        },
        {
          heading: "Source of Funds",
          body: "For significant deposits or unusual activity, we may request evidence of the source of your funds and, in some cases, the source of your wealth. This may include payslips, bank statements, or documentation of business income. This is a standard regulatory requirement, not an accusation.",
        },
        {
          heading: "Transaction Monitoring",
          body: "We monitor deposit, betting, and withdrawal patterns to identify activity that may be inconsistent with a customer's profile. Automated and manual reviews help us detect fraud, structuring, and other indicators of money laundering.",
        },
        {
          heading: "Suspicious Activity Reporting",
          body: "Where we suspect that funds may be linked to criminal activity, we are obligated to file a report with the relevant financial intelligence unit. We are generally prohibited from informing you that such a report has been made.",
        },
        {
          heading: "Sanctions & PEP Screening",
          body: "We screen customers against applicable sanctions lists and identify politically exposed persons (PEPs). Accounts matching sanctioned individuals or entities will be refused or closed. PEPs may be subject to enhanced due diligence.",
        },
        {
          heading: "Record Keeping",
          body: "We retain KYC documents and transaction records for the period required by law, which is typically five years after the end of the business relationship or the date of a suspicious transaction, whichever is later.",
        },
        {
          heading: "Customer Responsibilities",
          list: [
            "Provide accurate and truthful information at all times.",
            "Notify us of any change to your personal details.",
            "Respond promptly to verification requests to avoid withdrawal delays.",
            "Do not use another person's identity, documents, or payment methods.",
          ],
        },
        {
          heading: "Consequences of Non-Compliance",
          body: "Failure to complete verification or provide requested documentation may result in suspended withdrawals, restricted account features, or account closure. In cases of suspected money laundering, funds may be held pending investigation and reported to the authorities.",
        },
        {
          heading: "Cooperation with Authorities",
          body: "PARYAJ 888 cooperates fully with regulators, financial intelligence units, and law enforcement in the discharge of its AML obligations, including responding to information requests and court orders within the bounds of applicable law.",
        },
      ]}
    />
  );
}