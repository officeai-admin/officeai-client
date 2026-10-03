import { Settings } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { AltTextGenerator } from "@/components/tools/AltTextGenerator";
import { PdfDataExtractor } from "@/components/tools/PdfDataExtractor";
import { ResearchAgent } from "@/components/tools/ResearchAgent";
import { LoginButton } from "@/components/auth/LoginButton";
import { BackendStatus } from "@/components/status/BackendStatus";

export function SidebarFooter() {
  return (
    <div className="border-t border-border">
      <div className="px-2.5 pt-2">
        <BackendStatus />
      </div>

      <div className="flex items-center justify-between p-2.5">
        <div className="flex items-center gap-1">
          <button aria-label="Settings" className="rounded-md p-1.5 text-muted-foreground hover:bg-muted">
            <Settings size={16} />
          </button>
          <AltTextGenerator />
          <PdfDataExtractor />
          <ResearchAgent />
        </div>
        <ThemeToggle />
        <LoginButton />
      </div>
    </div>
  );
}






















// import { Settings } from "lucide-react";
// import { ThemeToggle } from "@/components/theme/ThemeToggle";
// import { AltTextGenerator } from "@/components/tools/AltTextGenerator";
// import { PdfDataExtractor } from "@/components/tools/PdfDataExtractor";
// import { ResearchAgent } from "@/components/tools/ResearchAgent";
// import { LoginButton } from "@/components/auth/LoginButton";

// export function SidebarFooter() {
//   return (
//     <div className="flex items-center justify-between border-t border-border p-2.5">
//       <div className="flex items-center gap-1">
//         <button aria-label="Settings" className="rounded-md p-1.5 text-muted-foreground hover:bg-muted">
//           <Settings size={16} />
//         </button>
//         <AltTextGenerator />
//         <PdfDataExtractor />
//         <ResearchAgent />
//       </div>
//       <ThemeToggle />
//       <LoginButton />
//     </div>
//   );
// }