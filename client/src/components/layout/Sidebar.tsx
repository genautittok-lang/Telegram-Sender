import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, Terminal, Activity, Globe, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage, Language } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const languages: { code: Language; label: string; flag: string }[] = [
  { code: 'uk', label: 'Українська', flag: '🇺🇦' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

export function Sidebar() {
  const [location] = useLocation();
  const { t, lang, setLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on location change on mobile
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navigation = [
    { name: t('dashboard'), href: '/', icon: LayoutDashboard },
    { name: t('accounts'), href: '/accounts', icon: Users },
    { name: t('logs'), href: '/logs', icon: Terminal },
  ];

  const currentLang = languages.find(l => l.code === lang);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Tele<span className="text-primary">Matic</span>
            </h1>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden" 
            onClick={() => setIsOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
        
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  data-testid={`nav-${item.href.replace('/', '') || 'dashboard'}`}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-border space-y-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              data-testid="button-language"
            >
              <Globe className="h-4 w-4" />
              <span>{currentLang?.flag} {currentLang?.label}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {languages.map((l) => (
              <DropdownMenuItem 
                key={l.code}
                onClick={() => setLang(l.code)}
                className={cn(lang === l.code && "bg-muted")}
                data-testid={`lang-${l.code}`}
              >
                <span className="mr-2">{l.flag}</span>
                {l.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 rounded-lg">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-mono text-muted-foreground">{t('systemOperational')}</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setIsOpen(true)}
          className="bg-card shadow-lg"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Sidebar Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar Mobile Drawer */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 bg-card border-r border-border z-50 transition-transform duration-300 lg:hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {sidebarContent}
      </aside>
    </>
  );
}
