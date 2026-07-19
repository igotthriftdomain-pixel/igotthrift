import { type StorefrontDetails } from "../types";
import { Globe, MapPin, Send } from "lucide-react";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export function StorefrontFooter({ store }: { store: StorefrontDetails }) {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-12 text-zinc-500 dark:text-zinc-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-8 md:grid-cols-3">
        {/* Branding & description */}
        <div className="space-y-4">
          <h4 className="font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">{store.name}</h4>
          <p className="text-xs text-zinc-500 leading-relaxed max-w-xs">
            {store.description || "Thank you for visiting! Browse our curated collections and complete checkouts seamlessly on WhatsApp."}
          </p>
        </div>

        {/* Contact/Address */}
        <div className="space-y-4">
          <h4 className="font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Visit Us</h4>
          <div className="space-y-2 text-xs">
            {store.address ? (
              <p className="flex items-start gap-2">
                <MapPin className="size-4 shrink-0 text-zinc-400 mt-0.5" />
                <span>{store.address}</span>
              </p>
            ) : (
              <p className="text-zinc-400">Online Store Only</p>
            )}
            {store.whatsappNumber && (
              <p className="flex items-start gap-2">
                <Send className="size-4 shrink-0 text-zinc-400 mt-0.5" />
                <span>WhatsApp: {store.whatsappNumber}</span>
              </p>
            )}
          </div>
        </div>

        {/* Social connections */}
        <div className="space-y-4">
          <h4 className="font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Follow Us</h4>
          <div className="flex gap-4 text-zinc-500 dark:text-zinc-400">
            {store.instagram && (
              <a href={store.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--store-theme)] transition-colors" aria-label="Instagram Link">
                <InstagramIcon className="size-5" />
              </a>
            )}
            {store.facebook && (
              <a href={store.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--store-theme)] transition-colors" aria-label="Facebook Link">
                <FacebookIcon className="size-5" />
              </a>
            )}
            {store.website && (
              <a href={store.website} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--store-theme)] transition-colors" aria-label="Store Website Link">
                <Globe className="size-5" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-8 border-t border-zinc-150 dark:border-zinc-900 text-center text-xs text-zinc-400">
        <p>&copy; {new Date().getFullYear()} {store.name}. All rights reserved.</p>
        <p className="mt-1">Powered by Commerce Engine. Direct WhatsApp order routing.</p>
      </div>
    </footer>
  );
}
