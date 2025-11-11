import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-green-500 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-green-400"></div>
                </div>
              </div>
              <span className="text-gray-900">GuestPostCRM</span>
            </div>
            <p className="text-gray-600 text-sm mb-4 max-w-md">
              The all-in-one platform for managing guest post campaigns, email
              automation, deals, and link tracking. Streamline your content
              marketing workflow with powerful CRM tools.
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-600" />
                <span>support@guestpostcrm.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-purple-600" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-600" />
                <span>123 Marketing Street, Digital City, DC 12345</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-gray-900 mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                >
                  API Reference
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Icons & Copyright */}
        <div className="pt-6 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-gray-600 text-sm">
            © {currentYear} GuestPostCRM. All rights reserved.
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all group"
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4 text-gray-600 group-hover:text-white" />
            </a>

            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all group"
              aria-label="Twitter"
            >
              <Twitter className="w-4 h-4 text-gray-600 group-hover:text-white" />
            </a>

            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-blue-700 hover:text-white transition-all group"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-4 h-4 text-gray-600 group-hover:text-white" />
            </a>

            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600 hover:text-white transition-all group"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4 text-gray-600 group-hover:text-white" />
            </a>

            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all group"
              aria-label="YouTube"
            >
              <Youtube className="w-4 h-4 text-gray-600 group-hover:text-white" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
