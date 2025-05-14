'use client';

import Link from 'next/link';
import Head from 'next/head';

export default function MasterFeeAgreement() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Master Fee Agreement | CIM Amplify</title>
        <meta name="description" content="Master Fee Agreement for CIM Amplify Services" />
      </Head>
      
      <div className="container mx-auto px-4 py-12 ">
        <h1 className="text-4xl font-bold text-center mb-8">CIM AMPLIFY MASTER FEE AGREEMENT</h1>
        <p className="text-center text-gray-600 mb-12">Effective Upon Buyer Registration on CIM Amplify</p>

        <div className="bg-white shadow-lg rounded-lg p-8">
          <section className="mb-8">
            <p>
              This Master Fee Agreement (“Agreement”) is entered into by and between CIM Amplify (“CIM Amplify”) and the undersigned party (“Recipient”), effective upon Recipient’s acceptance of this Agreement during the buyer registration process on the CIM Amplify platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">TABLE OF CONTENTS</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li><a href="#section1" className="text-blue-600 hover:underline">Scope</a></li>
              <li><a href="#section2" className="text-blue-600 hover:underline">Fee Structure</a></li>
              <li><a href="#section3" className="text-blue-600 hover:underline">Definition of Transaction Value</a></li>
              <li><a href="#section4" className="text-blue-600 hover:underline">Payment Terms</a></li>
              <li><a href="#section5" className="text-blue-600 hover:underline">Term</a></li>
              <li><a href="#section6" className="text-blue-600 hover:underline">Acknowledgment</a></li>
              <li><a href="#section7" className="text-blue-600 hover:underline">Miscellaneous</a></li>
              <li><a href="#section8" className="text-blue-600 hover:underline">Acceptance</a></li>
            </ol>
          </section>

          <section id="section1" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Scope</h2>
            <p>
              Recipient acknowledges that CIM Amplify may introduce Recipient to opportunities to acquire businesses (“Target Companies”). This Agreement governs the payment of success fees to CIM Amplify in the event Recipient completes a transaction involving a Target Company introduced through CIM Amplify.
            </p>
          </section>

          <section id="section2" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Fee Structure</h2>
            <p>
              Recipient agrees to pay CIM Amplify a success fee of .5% (50 basis points) of Transaction Value, payable upon the closing of any Transaction. The minimum success fee payable for any Transaction shall be $50,000 USD.
            </p>
            <p className="mt-2 font-medium">Example:</p>
            <p>A transaction valued at $22,000,000 USD would result in a success fee of $110,000 USD.</p>
            <p className="mt-4 font-medium">Annual Fee Escalation:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>2026: .55% (55 basis points)</li>
              <li>2027: .6% (60 basis points)</li>
              <li>2028: .65% (65 basis points)</li>
              <li>And so forth</li>
            </ul>
            <p className="mt-4">
              <strong>Currency Conversion and Payment:</strong> If a Transaction is consummated in a currency other than U.S. dollars, the Transaction Value shall be converted into USD using the prevailing exchange rate on the closing date of the Transaction as published by the U.S. Federal Reserve or another reliable financial institution agreed to by CIM Amplify. All fees under this Agreement shall be paid in U.S. dollars.
            </p>
          </section>

          <section id="section3" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Definition of Transaction Value</h2>
            <p>
              “Transaction Value” means the total consideration paid or payable, directly or indirectly, by Recipient or its affiliates in connection with the acquisition of a Target Company, including:
            </p>
            <ul className="list-disc pl-6 mt-2">
              <li>Cash, notes, or securities paid at closing;</li>
              <li>Assumption or repayment of debt or liabilities;</li>
              <li>Earn-outs, milestone payments, or contingent payments;</li>
              <li>Value of retained or rollover equity;</li>
              <li>Any consideration paid to the seller directly or indirectly over time.</li>
            </ul>
          </section>

          <section id="section4" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Payment Terms</h2>
            <p>
              Fees are due and payable within 30 business days of the closing of any Transaction involving a Target Company introduced by CIM Amplify. Fees not received within the above noted 30 days will be subject to a compounding 5% per 30 days interest charge.
            </p>
          </section>

          <section id="section5" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Term</h2>
            <p>
              This Agreement shall apply to all Transactions consummated within 24 months of introduction by CIM Amplify.
            </p>
          </section>

          <section id="section6" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Acknowledgment</h2>
            <ul className="list-disc pl-6 mt-2">
              <li>This Agreement is effective upon registration as a buyer on CIM Amplify;</li>
              <li>It applies regardless of whether CIM Amplify is formally engaged in a particular transaction;</li>
              <li>CIM Amplify is not acting as a broker-dealer and is not providing securities advice;</li>
              <li>Fees are due even if a separate intermediary (e.g., M&A advisor or broker) is involved.</li>
            </ul>
          </section>

          <section id="section7" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Miscellaneous</h2>
            <ul className="list-disc pl-6 mt-2">
              <li><strong>Governing Law:</strong> This Agreement shall be governed by and construed in accordance with the laws of the State of New York, without regard to its conflict of laws principles.</li>
              <li><strong>Entire Agreement:</strong> This document constitutes the entire agreement between the parties regarding the subject matter.</li>
              <li><strong>Modifications:</strong> Any changes must be in writing and signed by both parties.</li>
            </ul>
          </section>

          <section id="section8" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Acceptance</h2>
            <p className="uppercase font-bold">
              BY REGISTERING(AS A BUYER ON CIM AMPLIFY AND ACCEPTING THIS AGREEMENT, RECIPIENT ACKNOWLEDGES HAVING READ, UNDERSTOOD, AND AGREED TO THE TERMS ABOVE.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}