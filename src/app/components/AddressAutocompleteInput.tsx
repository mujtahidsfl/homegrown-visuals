import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

type AddressAutocompleteInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  // Layout classes belong on the wrapper, since that is the grid/flex child.
  containerClassName?: string;
};

export function AddressAutocompleteInput({
  value,
  onChange,
  placeholder,
  className,
  containerClassName,
}: AddressAutocompleteInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const hasGooglePlaces = Boolean(import.meta.env.VITE_GOOGLE_PLACES_API_KEY);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY as string | undefined;
    if (!apiKey || !inputRef.current) return;

    let active = true;
    let autocomplete: google.maps.places.Autocomplete | null = null;

    const loader = new Loader({ apiKey, libraries: ["places"] });
    loader
      .load()
      .then((googleMaps) => {
        if (!active || !inputRef.current) return;

        autocomplete = new googleMaps.maps.places.Autocomplete(inputRef.current, {
          types: ["address"],
          fields: ["formatted_address"],
        });

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete?.getPlace();
          const formatted = place?.formatted_address ?? inputRef.current?.value ?? "";
          onChangeRef.current(formatted);
        });
      })
      .catch(() => {
        // Fallback to a normal text input if Places fails to load.
      });

    return () => {
      active = false;
      if (autocomplete) {
        google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, []);

  useEffect(() => {
    if (hasGooglePlaces) return;
    const query = value.trim();

    if (query.length < 3) {
      setSuggestions([]);
      setOpen(false);
      setHighlightedIndex(-1);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`,
          {
            signal: controller.signal,
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) return;

        const data = (await response.json()) as Array<{ display_name?: string }>;
        const nextSuggestions = data
          .map((item) => item.display_name?.trim())
          .filter((item): item is string => Boolean(item));

        setSuggestions(nextSuggestions);
        setOpen(nextSuggestions.length > 0);
        setHighlightedIndex(-1);
      } catch {
        // Ignore fallback lookup failures and preserve plain input behavior.
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [hasGooglePlaces, value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectSuggestion = (suggestion: string) => {
    onChangeRef.current(suggestion);
    setSuggestions([]);
    setOpen(false);
    setHighlightedIndex(-1);
  };

  return (
    <div ref={containerRef} className={`relative ${containerClassName ?? ""}`}>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          if (suggestions.length > 0) setOpen(true);
        }}
        onKeyDown={(event) => {
          if (!open || suggestions.length === 0) return;

          if (event.key === "ArrowDown") {
            event.preventDefault();
            setHighlightedIndex((current) => (current + 1) % suggestions.length);
          }

          if (event.key === "ArrowUp") {
            event.preventDefault();
            setHighlightedIndex((current) => (current <= 0 ? suggestions.length - 1 : current - 1));
          }

          if (event.key === "Enter" && highlightedIndex >= 0) {
            event.preventDefault();
            selectSuggestion(suggestions[highlightedIndex]);
          }

          if (event.key === "Escape") {
            setOpen(false);
          }
        }}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />

      {!hasGooglePlaces && open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-[14px] border border-[#d7e0eb] bg-white shadow-[0_20px_48px_rgba(15,23,42,0.12)]">
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion}-${index}`}
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                selectSuggestion(suggestion);
              }}
              className={`block w-full px-4 py-3 text-left text-[14px] leading-snug transition ${
                highlightedIndex === index ? "bg-[#f4f8fc] text-[#1F3A5F]" : "bg-white text-[#334155] hover:bg-[#f8fafc]"
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
