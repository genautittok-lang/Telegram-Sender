import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useRecipients, useBulkAddRecipients, useClearRecipients } from "@/hooks/use-telegram-api";
import { Users, Upload, Trash2, Loader2, Save } from "lucide-react";

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

  const handleAdd = async () => {
    if (!inputList.trim()) return;
    const identifiers = inputList.split("\n").map(s => s.trim()).filter(Boolean);
    await bulkAdd.mutateAsync({ accountId, identifiers });
    setInputList("");
  };

  const handleClear = async () => {
    if (confirm("Are you sure you want to delete ALL recipients for this account?")) {
      await clear.mutateAsync({ accountId });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline" size="sm"><Users className="mr-2 h-4 w-4" /> Recipients</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] h-[600px] flex flex-col bg-card border-border">
        <DialogHeader>
          <DialogTitle>Manage Recipients</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">
          {/* Left Column: Upload */}
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Add Recipients</h4>
              <p className="text-xs text-muted-foreground">Paste one username or phone number per line.</p>
            </div>
            <Textarea 
              className="flex-1 font-mono text-xs resize-none bg-muted/50 border-border" 
              placeholder="@username1&#10;@username2&#10;+1234567890"
              value={inputList}
              onChange={(e) => setInputList(e.target.value)}
            />
            <Button onClick={handleAdd} disabled={bulkAdd.isPending || !inputList.trim()}>
              {bulkAdd.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Import List
            </Button>
          </div>

          {/* Right Column: List */}
          <div className="flex flex-col gap-4 border-l border-border pl-6">
             <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Current List ({recipients?.length || 0})</h4>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2"
                onClick={handleClear}
                disabled={!recipients?.length}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Clear All
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
                          {r.status}
                        </Badge>
                      </div>
                    ))}
                    {!recipients?.length && (
                      <div className="text-center p-8 text-muted-foreground text-xs">
                        No recipients yet.
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
