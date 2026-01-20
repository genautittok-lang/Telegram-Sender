import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useRecipients, useBulkAddRecipients, useClearRecipients } from "@/hooks/use-telegram-api";
import { Users, Trash2, Loader2, Save } from "lucide-react";
import { useLanguage, parseRecipientsList } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";

interface RecipientsDialogProps {
  accountId: number;
  trigger?: React.ReactNode;
}

export function RecipientsDialog({ accountId, trigger }: RecipientsDialogProps) {
  const [open, setOpen] = useState(false);
  const [inputList, setInputList] = useState("");
  const { data: recipients, isLoading } = useRecipients(accountId);
  const bulkAdd = useBulkAddRecipients();
  const clear = useClearRecipients();
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleAdd = async () => {
    if (!inputList.trim()) return;
    
    const phones = parseRecipientsList(inputList);
    
    if (phones.length === 0) {
      toast({ 
        title: t('noValidPhones'), 
        variant: "destructive" 
      });
      return;
    }
    
    await bulkAdd.mutateAsync({ accountId, identifiers: phones });
    toast({ 
      title: `${phones.length} ${t('phonesExtracted')}` 
    });
    setInputList("");
  };

  const handleClear = async () => {
    if (confirm(t('clearConfirm'))) {
      await clear.mutateAsync({ accountId });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" data-testid="button-recipients">
            <Users className="mr-2 h-4 w-4" /> {t('recipients')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] h-[600px] flex flex-col bg-card border-border">
        <DialogHeader>
          <DialogTitle>{t('manageRecipients')}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">{t('addRecipients')}</h4>
              <p className="text-xs text-muted-foreground">{t('recipientsHint')}</p>
            </div>
            <Textarea 
              className="flex-1 font-mono text-xs resize-none bg-muted/50 border-border" 
              placeholder="Іванов Іван — 2000-01-01 — +380501234567&#10;Петров Петро — 2001-02-02 — 79001234567&#10;+79501234567"
              value={inputList}
              onChange={(e) => setInputList(e.target.value)}
              data-testid="textarea-recipients"
            />
            <Button 
              onClick={handleAdd} 
              disabled={bulkAdd.isPending || !inputList.trim()}
              data-testid="button-import-recipients"
            >
              {bulkAdd.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {t('importList')}
            </Button>
          </div>

          <div className="flex flex-col gap-4 border-l border-border pl-6">
             <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">{t('currentList')} ({recipients?.length || 0})</h4>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2"
                onClick={handleClear}
                disabled={!recipients?.length}
                data-testid="button-clear-recipients"
              >
                <Trash2 className="h-4 w-4 mr-2" /> {t('clearRecipients')}
              </Button>
            </div>
            
            <div className="bg-muted/30 rounded-md border border-border flex-1 min-h-0 overflow-hidden relative">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ScrollArea className="h-full">
                  <div className="p-2 space-y-1">
                    {recipients?.map((r) => (
                      <div key={r.id} className="flex items-center justify-between p-2 rounded hover:bg-muted text-xs font-mono group">
                        <span>{r.identifier}</span>
                        <Badge 
                          variant="outline" 
                          className={
                            r.status === 'sent' ? 'border-emerald-500/50 text-emerald-500' :
                            r.status === 'failed' ? 'border-red-500/50 text-red-500' :
                            'border-zinc-500/50 text-zinc-500'
                          }
                        >
                          {r.status === 'sent' ? t('sent') : r.status === 'failed' ? t('failed') : t('pending')}
                        </Badge>
                      </div>
                    ))}
                    {!recipients?.length && (
                      <div className="text-center p-8 text-muted-foreground text-xs">
                        {t('noRecipients')}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
