import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Sparkles, X } from "lucide-react";
import { useNavigate } from "react-router";
import { getRotatingSuggestions, searchSite } from "./siteSearch";

type SmartSearchBoxProps = {
  overlay?: boolean;
  flat?: boolean;
};

export function SmartSearchBox({ overlay = false, flat = false }: SmartSearchBoxProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>(() => getRotatingSuggestions());
  const results = useMemo(() => searchSite(query), [query]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const iconButtonClass =
    flat
      ? "w-[44px] h-[44px] rounded-full bg-transparent flex items-center justify-center hover:bg-[#1F3A5F]/8 transition-colors"
      : overlay
        ? "w-[44px] h-[44px] rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors"
        : "w-[44px] h-[44px] rounded-full bg-[#ffffff] flex items-center justify-center hover:bg-[#eef4fb] transition-colors";

  const rotateSuggestions = () => {
    setSuggestions((current) => getRotatingSuggestions(current));
  };

  const handleToggle = () => {
    if (!open) {
      rotateSuggestions();
      setOpen(true);
      return;
    }

    setQuery("");
    setOpen(false);
  };

  const handleNavigate = (href: string) => {
    setOpen(false);
    setQuery("");
    navigate(href);
  };

  return (
    <div className="relative flex items-center">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden mr-1"
          >
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search FAQs or portfolio..."
              className="w-full h-[44px] rounded-full bg-white px-5 text-[#1F3A5F] text-[14px] outline-none placeholder:text-[#1F3A5F]/40"
              style={{ fontFamily: "'Satoshi', sans-serif" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={handleToggle} className={iconButtonClass} aria-label="Open smart search">
        {open ? <X size={18} className="text-[#1F3A5F]" /> : <Search size={18} className="text-[#1F3A5F]" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 top-[calc(100%+12px)] z-[80] w-[min(30rem,calc(100vw-2rem))] rounded-[24px] border border-[#dbe3ef] bg-white p-4 shadow-[0_24px_60px_rgba(31,58,95,0.16)]"
          >
            {!query.trim() ? (
              <div>
                <div className="flex items-center justify-between gap-3">
                  <p
                    className="text-[#1F3A5F] text-[14px]"
                    style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}
                  >
                    Suggested searches
                  </p>
                  <button
                    type="button"
                    onClick={rotateSuggestions}
                    className="inline-flex items-center gap-2 rounded-full border border-[#dbe3ef] px-3 py-1.5 text-[12px] text-[#1F3A5F] hover:bg-[#f5f8fb]"
                    style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}
                  >
                    <Sparkles size={14} />
                    Show different ones
                  </button>
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setQuery(suggestion)}
                      className="w-full rounded-[16px] border border-[#edf2f7] bg-[#f8fbff] px-4 py-3 text-left text-[14px] text-[#1F3A5F] hover:bg-[#eef5ff]"
                      style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 600 }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : results.length ? (
              <div className="space-y-2">
                {results.map((result) => (
                  <button
                    key={result.id}
                    type="button"
                    onClick={() => handleNavigate(result.href)}
                    className="w-full rounded-[18px] border border-[#edf2f7] bg-white px-4 py-3 text-left hover:bg-[#f8fbff]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p
                        className="text-[#1F3A5F] text-[15px]"
                        style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}
                      >
                        {result.title}
                      </p>
                      <span
                        className="rounded-full bg-[#eef5ff] px-2.5 py-1 text-[11px] uppercase tracking-[0.08em] text-[#2FA4A9]"
                        style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 800 }}
                      >
                        {result.badge}
                      </span>
                    </div>
                    <p
                      className="mt-1 text-[13px] text-[#5a6983]"
                      style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500, lineHeight: 1.55 }}
                    >
                      {result.snippet}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-[18px] border border-[#edf2f7] bg-[#f8fbff] px-4 py-4">
                <p
                  className="text-[#1F3A5F] text-[14px]"
                  style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 700 }}
                >
                  No close match yet
                </p>
                <p
                  className="mt-1 text-[13px] text-[#5a6983]"
                  style={{ fontFamily: "'Satoshi', sans-serif", fontWeight: 500, lineHeight: 1.55 }}
                >
                  Try a service term like “virtual twilight”, “interior photos”, or ask a booking question.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
