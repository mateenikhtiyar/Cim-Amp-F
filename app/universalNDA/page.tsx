import Link from 'next/link';
import Head from 'next/head';

export default function MasterNDA() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Master Non-Disclosure Agreement | CIM Amplify</title>
        <meta name="description" content="Master Non-Disclosure Agreement for CIM Amplify Services" />
      </Head>
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8">Master Non-Disclosure Agreement (NDA)</h1>
        <p className="text-center text-gray-600 mb-12">Effective Upon Buyer Registration on CIM Amplify</p>

        <div className="bg-white shadow-lg rounded-lg p-8">
          <section className="mb-8">
            <p className="text-lg font-semibold text-red-600">
              Please review this agreement carefully. By registering as a buyer on CIM Amplify, you agree to be bound by its terms.
            </p>
            <p className="mt-4">
              If you have any questions about this Master NDA, please contact us at{' '}
              <Link href="mailto:info@cimamplify.com" className="text-blue-600 hover:underline">
                info@cimamplify.com
              </Link>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">TABLE OF CONTENTS</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li><a href="#section1" className="text-blue-600 hover:underline">Purpose</a></li>
              <li><a href="#section2" className="text-blue-600 hover:underline">Definition of Confidential Information</a></li>
              <li><a href="#section3" className="text-blue-600 hover:underline">Obligations of Recipient</a></li>
              <li><a href="#section4" className="text-blue-600 hover:underline">Term</a></li>
              <li><a href="#section5" className="text-blue-600 hover:underline">Remedies</a></li>
              <li><a href="#section6" className="text-blue-600 hover:underline">Jurisdiction</a></li>
              <li><a href="#section7" className="text-blue-600 hover:underline">No Obligation to Proceed</a></li>
              <li><a href="#section8" className="text-blue-600 hover:underline">No License</a></li>
              <li><a href="#section9" className="text-blue-600 hover:underline">Entire Agreement</a></li>
              <li><a href="#section10" className="text-blue-600 hover:underline">Acceptance</a></li>
              <li><a href="#section11" className="text-blue-600 hover:underline">Non-Circumvention</a></li>
              <li><a href="#section12" className="text-blue-600 hover:underline">Return or Destruction of Confidential Information</a></li>
            </ol>
          </section>

          <section id="section1" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Purpose</h2>
            <p>
              The Recipient is evaluating one or more potential transactions involving companies listed for sale or introduced through CIM Amplify. This Agreement governs all Confidential Information disclosed to the Recipient in relation to any such opportunities, whether the information is delivered through the platform or by an associated seller, M&A advisor, or intermediary.
            </p>
          </section>

          <section id="section2" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Definition of Confidential Information</h2>
            <p>
              "Confidential Information" includes, without limitation:
            </p>
            <ul className="list-disc pl-6 mt-2">
              <li>The fact that a company is for sale;</li>
              <li>The identity of any such company;</li>
              <li>Financial data, customer lists, contracts, intellectual property, trade secrets, business plans, operational details, supplier agreements, and other non-public business materials.</li>
            </ul>
            <p className="mt-4">
              This applies regardless of how the information is disclosed and by whom.
            </p>
          </section>

          <section id="section3" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Obligations of Recipient</h2>
            <p>
              The Recipient agrees to:
            </p>
            <ul className="list-disc pl-6 mt-2">
              <li>Maintain all Confidential Information in strict confidence;</li>
              <li>Not disclose, reproduce, or share without prior written consent;</li>
              <li>Not use for competitive analysis or reverse engineering;</li>
              <li>Not contact or solicit any related party without permission;</li>
              <li>Only share information with authorized parties in writing.</li>
            </ul>
          </section>

          <section id="section4" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Term</h2>
            <p>
              This Agreement is effective upon clicking “Approve” and lasts one (1) year per opportunity. Confidentiality obligations survive until information becomes public through no fault of the Recipient.
            </p>
          </section>

          <section id="section5" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Remedies</h2>
            <p>
              Breach of this Agreement may result in:
            </p>
            <ul className="list-disc pl-6 mt-2">
              <li>Immediate injunctive relief;</li>
              <li>Recovery of attorneys’ fees and enforcement costs;</li>
              <li>All other available remedies including monetary damages.</li>
            </ul>
          </section>

          <section id="section6" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Jurisdiction</h2>
            <p>
              The governing law and exclusive jurisdiction shall be that of the location of the disclosed company’s headquarters.
            </p>
          </section>

          <section id="section7" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. No Obligation to Proceed</h2>
            <p>
              Nothing obligates CIM Amplify or any party to proceed with any transaction or further disclosure.
            </p>
          </section>

          <section id="section8" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. No License</h2>
            <p>
              No rights or licenses are granted under intellectual property through disclosure of Confidential Information.
            </p>
          </section>

          <section id="section9" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Entire Agreement</h2>
            <p>
              This Agreement is the entire understanding between parties and may only be amended in writing and accepted by both parties.
            </p>
          </section>

          <section id="section10" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Acceptance</h2>
            <p className="uppercase font-bold">
              BY REGISTERING AS A BUYER ON CIM AMPLIFY AND ACCESSING COMPANY INFORMATION, RECIPIENT AFFIRMS ACCEPTANCE OF THIS MASTER NDA AND AGREES TO BE BOUND BY ITS TERMS.
            </p>
          </section>

          <section id="section11" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Non-Circumvention</h2>
            <p>
              For two (2) years from first disclosure, the Recipient agrees not to:
            </p>
            <ul className="list-disc pl-6 mt-2">
              <li>Circumvent CIM Amplify or its partners;</li>
              <li>Engage with the target company without written consent.</li>
            </ul>
            <p className="mt-4">
              Breach entitles CIM Amplify to injunctive relief and appropriate compensation.
            </p>
          </section>

          <section id="section12" className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Return or Destruction of Confidential Information</h2>
            <p>
              Upon request or declined transaction, the Recipient must:
            </p>
            <ul className="list-disc pl-6 mt-2">
              <li>Cease all use of the information;</li>
              <li>Return or destroy all copies (physical/digital);</li>
              <li>Confirm in writing that all data has been deleted.</li>
            </ul>
            <p className="mt-4">
              This obligation survives termination Pekka.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p>
              For questions or concerns regarding this Master NDA, please contact us at:
            </p>
            <p className="mt-4">
              CIM Amplify
            </p>
            <p>
              <Link href="mailto:info@cimamplify.com" className="text-blue-600 hover:underline">
                info@cimamplify.com
              </Link>
            </p>
          </section>

          
        </div>
      </div>
    </div>
  );
}