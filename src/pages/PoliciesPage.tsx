import React, { useEffect } from "react";

interface PoliciesPageProps {
  section?: string;
}

const policySections = [
  {
    id: "terms",
    title: "Terms of Service",
    paragraphs: [
      "When you place an order with SAMM AI, you agree to these terms. Please check the product page before paying: it explains the plan length, what is included, and how access is provided.",
      "You are responsible for giving us correct contact details and following the service provider’s terms. Access may be an invitation, activation code, or another method described on the listing. Do not share credentials or use a service in a way that breaks its rules.",
      "Prices are shown in the selected currency and confirmed at checkout. An order is accepted after payment is confirmed. For OPay transfers, confirmation is manual; submitting an order or receipt does not mean payment has cleared. We may correct a listing or cancel an order if a price or availability error prevents us from supplying it. Any amount paid for a cancelled, unfulfilled order will be handled under the Refund Policy.",
      "SAMM AI is an independent seller and support contact. Unless a listing says otherwise, the software and trademarks belong to their respective providers. We do not claim to be affiliated with or endorsed by them.",
      "These terms do not limit any rights you have under applicable consumer-protection law. For questions, contact amaechisamuelugo@gmail.com or WhatsApp 07036192301.",
    ],
  },
  {
    id: "privacy",
    title: "Privacy Policy",
    paragraphs: [
      "We collect the details needed to process and support an order: your name, email address, phone or WhatsApp number, order contents, payment status, and any receipt or delivery notes you choose to provide.",
      "We use this information to confirm orders, arrange delivery, respond to support requests, prevent payment errors, and meet record-keeping obligations. We do not sell customer contact details. Payment processing is handled by the payment service you choose; do not send us your card PIN, password, or one-time code.",
      "Order information may be handled by the hosting, storage, messaging, and payment providers needed to operate the store. We keep records only for as long as needed for service, dispute handling, and legal obligations, then delete or anonymise them where appropriate.",
      "You can ask to access or correct your personal information, or raise a privacy concern, by emailing amaechisamuelugo@gmail.com. We may need to retain transaction records where the law requires it.",
    ],
  },
  {
    id: "delivery",
    title: "Digital Delivery & Access Support",
    paragraphs: [
      "After payment is confirmed, we send the access method and setup instructions to the email address or WhatsApp number supplied at checkout. Most orders are prepared within 5–30 minutes during support hours; some products or busy periods can take longer. We will let you know if there is a delay.",
      "OPay and other manual bank transfers remain pending until we can confirm the funds in our account. A screenshot or debit notification helps us investigate but is not proof that funds have cleared. Please include your order number if you contact us.",
      "Check your spam folder and confirm that the email and phone number on your order are correct. If access does not work, contact us promptly with the order number and a description of the issue. We will help troubleshoot or arrange a replacement where the access supplied is faulty and the issue is within our control.",
      "The subscription length and any account, device, or usage limits are those stated on the product page at the time of purchase. Renewal is not automatic unless the listing explicitly says otherwise.",
    ],
  },
  {
    id: "refunds",
    title: "Refund & Replacement Policy",
    paragraphs: [
      "Digital subscriptions and license products can be difficult to recover once access has been issued. For that reason, a change of mind after delivery or activation is generally not eligible for a refund, except where applicable law requires one.",
      "If we have not started fulfilling an order, contact us as soon as possible to request cancellation. Once a code, invitation, or account access has been issued, tell us within 7 days if it is missing, invalid, or materially different from the listing. We will investigate and, where possible, fix the issue or provide replacement access for the remaining paid term.",
      "If we cannot provide the purchased access or resolve a confirmed fault, we will offer a refund for the affected item. Duplicate charges and payments for orders we cancel will also be reviewed for refund. Approved refunds are sent through the original payment route where possible; processing time depends on the bank or payment provider.",
      "For a transfer payment, include your order number and payment receipt when contacting us. Do not send card details, PINs, passwords, or one-time codes. Contact amaechisamuelugo@gmail.com or WhatsApp 07036192301 to start a request.",
      "Nothing in this policy removes rights that cannot legally be excluded.",
    ],
  },
];

export const PoliciesPage: React.FC<PoliciesPageProps> = ({ section }) => {
  useEffect(() => {
    if (section) {
      document
        .getElementById(section)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [section]);

  return (
    <main className="py-12 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-10 sm:mb-14">
          <p className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-2">
            Clear terms, no surprises
          </p>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Policies
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-3">
            Last updated: 1 October 2026. These policies explain how orders,
            access, personal information, and refund requests are handled.
          </p>
          <nav
            aria-label="Policy sections"
            className="flex flex-wrap gap-2 mt-6"
          >
            {policySections.map(({ id, title }) => (
              <a
                key={id}
                href={`#${id}`}
                className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-emerald-400"
              >
                {title}
              </a>
            ))}
          </nav>
        </header>

        <div className="space-y-5">
          {policySections.map((policy) => (
            <section
              id={policy.id}
              key={policy.id}
              className="scroll-mt-28 p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
                {policy.title}
              </h2>
              <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
                {policy.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
};
