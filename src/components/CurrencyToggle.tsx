"use client";

interface Props {
  currency: string;
  onChange: (currency: string) => void;
}

export default function CurrencyToggle({ currency, onChange }: Props) {
  return (
    <div className="flex rounded-sm border border-neutral-600 overflow-hidden">
      <button
        type="button"
        data-currency="HNL"
        onClick={() => onChange("HNL")}
        className={`flex-1 cursor-pointer px-2 py-2 text-sm font-medium transition-colors ${
          currency === "HNL"
            ? "bg-green-800 text-white"
            : "bg-neutral-800 text-neutral-400 hover:text-white"
        }`}
      >
        L.
      </button>
      <button
        type="button"
        data-currency="USD"
        onClick={() => onChange("USD")}
        className={`flex-1 cursor-pointer px-2 py-2 text-sm font-medium transition-colors ${
          currency === "USD"
            ? "bg-green-800 text-white"
            : "bg-neutral-800 text-neutral-400 hover:text-white"
        }`}
      >
        $
      </button>
    </div>
  );
}
