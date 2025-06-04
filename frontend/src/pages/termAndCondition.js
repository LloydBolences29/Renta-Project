import React from 'react';

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-10 px-4">
      <div className="max-w-3xl w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold text-center text-indigo-600 mb-6">
          Terms and Conditions
        </h1>
        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
            <p>
              Welcome to RENTA, your trusted solution for rental management. By accessing our platform, you agree to these Terms and Conditions. Please read them carefully.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">2. Use of the Platform</h2>
            <p>
              RENTA grants you a limited, non-exclusive, non-transferable license to use our platform. You agree not to misuse our services; any violation may result in termination of your account.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">3. Account Responsibilities</h2>
            <p>
              Users are responsible for maintaining the confidentiality of their account credentials. You are solely responsible for all activities that occur under your account.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">4. Payment Terms</h2>
            <p>
              All rental payments must be made in a timely manner as stipulated in your rental agreement. Late payments may incur additional fees.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">5. Privacy Policy</h2>
            <p>
              We value your privacy. Please review our Privacy Policy to understand how we collect, use, and share your information.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">6. Liability</h2>
            <p>
              RENTA is not liable for any damages or losses resulting from the use of our platform. Use it at your own risk.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">7. Modifications to Terms</h2>
            <p>
              We reserve the right to modify these Terms and Conditions at any time. Continued use of the platform indicates your acceptance of any changes.
            </p>
          </section>
        </div>
        <div className="mt-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} RENTA. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
