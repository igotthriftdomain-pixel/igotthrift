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
    <footer className="border-t border-zinc-800 bg-[#0A0A0A] py-16 text-zinc-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-10 md:grid-cols-3">
        {/* Branding & description */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {store.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={store.logoUrl} alt={store.name} className="size-8 rounded-full object-cover border border-[#FFBC0A]" />
            ) : (
              <div className="size-8 rounded-full bg-[#FFBC0A] text-[#0A0A0A] flex items-center justify-center font-black text-xs uppercase">
                {store.name.substring(0, 2)}
              </div>
            )}
            <h4 className="font-black text-[#FAF8F3] text-lg tracking-tight uppercase">{store.name}</h4>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
            {store.description || "Curated vintage thrift & streetwear drops. Hand-checked for quality & authenticity with seamless WhatsApp ordering."}
          </p>
        </div>

        {/* Contact/Address */}
        <div className="space-y-4">
          <h4 className="font-extrabold text-[#FFBC0A] text-xs uppercase tracking-widest">Store Location & Contact</h4>
          <div className="space-y-2.5 text-xs text-zinc-300">
            {store.address ? (
              <p className="flex items-start gap-2">
                <MapPin className="size-4 shrink-0 text-[#FFBC0A] mt-0.5" />
                <span>{store.address}</span>
              </p>
            ) : (
              <p className="text-zinc-500">Online Boutique Store</p>
            )}
            {store.whatsappNumber && (
              <p className="flex items-start gap-2">
                <Send className="size-4 shrink-0 text-[#FFBC0A] mt-0.5" />
                <span>WhatsApp: {store.whatsappNumber}</span>
              </p>
            )}
          </div>
        </div>

        {/* Social connections */}
        <div className="space-y-4">
          <h4 className="font-extrabold text-[#FFBC0A] text-xs uppercase tracking-widest">Connect With Us</h4>
          <div className="flex gap-4 text-zinc-400">
            {store.instagram && (
              <a
                href={store.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="size-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:text-[#FFBC0A] hover:border-[#FFBC0A] transition-colors"
                aria-label="Instagram Link"
              >
                <InstagramIcon className="size-4" />
              </a>
            )}
            {store.facebook && (
              <a
                href={store.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="size-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:text-[#FFBC0A] hover:border-[#FFBC0A] transition-colors"
                aria-label="Facebook Link"
              >
                <FacebookIcon className="size-4" />
              </a>
            )}
            {store.website && (
              <a
                href={store.website}
                target="_blank"
                rel="noopener noreferrer"
                className="size-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:text-[#FFBC0A] hover:border-[#FFBC0A] transition-colors"
                aria-label="Store Website Link"
              >
                <Globe className="size-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-zinc-900 text-center text-xs text-zinc-500">
        <p>&copy; {new Date().getFullYear()} {store.name}. All rights reserved.</p>
      </div>
    </footer>
  );
}
