export default function Footer() {
  return (
    <div className="w-full mt-50 flex justify-center bg-white py-6">
      <div className="w-[95%]  bg-gray-100 rounded-xl px-6 py-6 text-center">
        <p className="text-sm md:text-base text-gray-700 leading-relaxed">
          <span className="font-semibold">Copyright © 2025 GuestPostCRM™</span>,
          All Rights Reserved. The{" "}
          <span className="font-semibold">
            OutRight® logo is a trademark of OutRight Systems Pvt. Ltd.
          </span>
          All content and materials on this site are protected by copyright.
        </p>

        <div className="flex flex-wrap justify-center gap-6 mt-4 text-sm md:text-base">
          <a href="#" className="text-green-700 underline hover:text-green-900">
            GDPR
          </a>
          <a href="#" className="text-green-700 underline hover:text-green-900">
            Copyright – Legal
          </a>
          <a href="#" className="text-green-700 underline hover:text-green-900">
            Cookie Policy
          </a>
          <a href="#" className="text-green-700 underline hover:text-green-900">
            Privacy Policy
          </a>
          <a href="#" className="text-green-700 underline hover:text-green-900">
            Terms and Conditions
          </a>
        </div>
      </div>
    </div>
  );
}
