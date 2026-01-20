import { useEffect, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { useLogs } from "@/hooks/use-telegram-api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useLanguage } from "@/lib/i18n";

export default function Logs() {
  const { data: logs } = useLogs();
  const bottomRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="mb-4">
          <h2 className="text-3xl font-bold tracking-tight">{t('logs')}</h2>
          <p className="text-muted-foreground">{t('realtimeLogs')}</p>
        </div>

        <div className="flex-1 rounded-lg border border-border bg-black/50 font-mono text-sm shadow-inner overflow-hidden flex flex-col">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-border/50 bg-muted/20">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
            </div>
            <span className="text-xs text-muted-foreground ml-2">{t('consoleLog')}</span>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-1">
              {logs?.map((log) => (
                <div key={log.id} className="flex gap-3 hover:bg-white/5 p-0.5 rounded px-2">
                  <span className="text-muted-foreground shrink-0 select-none">
                    {log.createdAt ? format(new Date(log.createdAt), 'HH:mm:ss') : '--:--:--'}
                  </span>
                  <span className={cn(
                    "uppercase font-bold text-[10px] w-12 shrink-0 pt-0.5",
                    log.level === 'error' ? 'text-red-500' :
                    log.level === 'warn' ? 'text-yellow-500' :
                    'text-blue-500'
                  )}>
                    [{log.level === 'error' ? t('error') : log.level === 'warn' ? t('warn') : t('info')}]
                  </span>
                  <span className={cn(
                    "break-all",
                    log.level === 'error' ? 'text-red-200' : 'text-zinc-300'
                  )}>
                    {log.message}
                  </span>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>
        </div>
      </div>
    </Layout>
  );
}
