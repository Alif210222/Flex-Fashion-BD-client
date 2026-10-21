
import { ArrowRight } from "lucide-react";

export default function AnnouncementBar() {
  return (
    <div className="bg-[#292821] px-4 py-2.5 text-center text-xs tracking-[0.12em] text-[#F7F3EB]">
      <p className="flex items-center justify-center gap-2">
        <span>EVERYDAY ESSENTIALS, MADE BETTER</span>
        <ArrowRight size={13} />
      </p>
    </div>
  );
}
