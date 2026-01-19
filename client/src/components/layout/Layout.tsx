import { Sidebar } from "./Sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <ScrollArea className="flex-1">
          <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
            {children}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
