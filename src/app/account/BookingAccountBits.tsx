import { useState } from "react";
import { addressChoices, shouldOfferSaveAddress } from "../booking/savedAddresses";
import { addAddress, type SavedAddress } from "./profileApi";

/** One-tap chips for saved addresses. Nothing is filled in until the customer taps one. */
export function SavedAddressChips({ saved, current, onPick }: { saved: SavedAddress[]; current: string; onPick: (address: string) => void }) {
  const choices = addressChoices(saved, current);
  if (!choices.length) return null;
  return (
    <div className="mt-3 sm:col-span-2" style={{ fontFamily: "'Satoshi', sans-serif" }}>
      <p className="text-[13px] font-semibold text-[#51607b]">Use a saved address</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {choices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            className="rounded-full border border-[#d9dce3] bg-white px-4 py-2 text-[13px] text-[#1F3A5F] hover:bg-[#f5f6f8]"
            onClick={() => onPick(choice.address)}
          >
            {choice.text}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Opt-in, unticked by default. A failure never blocks the booking. */
export function SaveAddressOffer({ saved, address, onSaved }: { saved: SavedAddress[]; address: string; onSaved: () => void }) {
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  if (state !== "saved" && !shouldOfferSaveAddress(saved, address)) return null;
  if (state === "saved") return <p className="mt-4 text-[14px] text-[#1a7f37]">Address saved to your account.</p>;
  return (
    <div className="mt-4" style={{ fontFamily: "'Satoshi', sans-serif" }}>
      <label className="flex items-center gap-3 text-[14px] text-[#1F3A5F]">
        <input
          type="checkbox"
          checked={false}
          disabled={state === "saving"}
          onChange={async (event) => {
            if (!event.target.checked) return;
            setState("saving");
            try {
              await addAddress({ label: "", address });
              setState("saved");
              onSaved();
            } catch {
              setState("error");
            }
          }}
        />
        Save this address to my account
      </label>
      {state === "error" && <p className="mt-1 text-[13px] text-[#51607b]">Couldn't save the address. Your booking is not affected.</p>}
    </div>
  );
}
