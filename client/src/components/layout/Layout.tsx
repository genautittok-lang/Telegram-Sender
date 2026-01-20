import { Sidebar } from "./Sidebar";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden pt-16 lg:pt-0">
        <div className="container mx-auto p-4 lg:p-8 max-w-7xl">
          <div className="flex flex-col gap-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
