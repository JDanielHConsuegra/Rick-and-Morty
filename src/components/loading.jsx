import { AiOutlineLoading3Quarters } from "react-icons/ai";

export function Loading({ text = "Loading…" }) {
  return (
    <div className="flex items-center justify-center gap-3 text-slate-600">
      <AiOutlineLoading3Quarters className="animate-spin text-5xl" />
      <span className="text-5xl">{text}</span>
    </div>
  );
}
