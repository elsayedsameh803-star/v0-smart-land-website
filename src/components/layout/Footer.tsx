import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-smart-dark-3 bg-smart-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-smart-gold to-smart-gold-dark rounded-lg flex items-center justify-center">
                <span className="text-smart-black font-bold text-sm">SL</span>
              </div>
              <span className="text-lg font-bold gold-gradient-text">Smart Land</span>
            </Link>
            <p className="text-sm text-smart-gray max-w-md">
              AI Digital Audit Platform — Evidence-driven digital presence analysis.
              Analyze, understand, and improve your digital presence.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-smart-gray hover:text-smart-gold transition-colors">
                  URL Analyzer
                </Link>
              </li>
              <li>
                <Link href="/methodology" className="text-sm text-smart-gray hover:text-smart-gold transition-colors">
                  Methodology
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-sm text-smart-gray hover:text-smart-gold transition-colors">
                  Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-smart-gray hover:text-smart-gold transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-smart-gray hover:text-smart-gold transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-smart-gray hover:text-smart-gold transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-smart-dark-3 flex flex-col sm:flex-row items-center justify-between">
          <p className="text-xs text-smart-gray-dark">
            © {new Date().getFullYear()} Smart Land. All rights reserved.
          </p>
          <p className="text-xs text-smart-gray-dark mt-2 sm:mt-0">
            Made with precision — AI Digital Audit Platform
          </p>
        </div>
      </div>
    </footer>
  );
}