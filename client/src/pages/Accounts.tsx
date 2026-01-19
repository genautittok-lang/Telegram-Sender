import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { AddAccountDialog } from "@/components/account/AddAccountDialog";
import { RecipientsDialog } from "@/components/account/RecipientsDialog";
import { useAccounts, useControlAccount, useDeleteAccount, useUpdateAccount } from "@/hooks/use-telegram-api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Play, Pause, Trash2, Settings2, Save } from "lucide-react";
import { format } from "date-fns";

export default function Accounts() {
  const { data: accounts, isLoading } = useAccounts();

  return (
    <Layout>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Accounts</h2>
          <p className="text-muted-foreground">Manage your connected Telegram accounts.</p>
        </div>
        <AddAccountDialog />
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-muted-foreground">Loading accounts...</div>
        ) : (
          accounts?.map((account) => (
            <AccountRow key={account.id} account={account} />
          ))
        )}
        {!isLoading && accounts?.length === 0 && (
          <div className="text-center py-24 text-muted-foreground border-2 border-dashed border-border rounded-xl">
            No accounts found. Add one to get started.
          </div>
        )}
      </div>
    </Layout>
  );
}

function AccountRow({ account }: { account: any }) {
  const control = useControlAccount();
  const deleteAccount = useDeleteAccount();

  const toggleRun = () => {
    const action = account.isRunning ? 'stop' : 'start';
    control.mutate({ id: account.id, action });
  };

  const handleDelete = () => {
    if (confirm(`Delete account ${account.phoneNumber}? This cannot be undone.`)) {
      deleteAccount.mutate(account.id);
    }
  };

  return (
    <Card className="overflow-hidden border-border bg-card hover:bg-muted/10 transition-colors">
      <div className="flex flex-col md:flex-row items-start md:items-center p-6 gap-6">
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-lg font-mono font-medium">{account.phoneNumber}</h3>
            <StatusBadge status={account.status || 'idle'} />
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            Added {account.createdAt ? format(new Date(account.createdAt), 'PP') : '-'}
            {account.group && ` • ${account.group.name}`}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleRun}
            className={account.isRunning ? "border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10" : "border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10"}
          >
            {account.isRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {account.isRunning ? "Pause" : "Start"}
          </Button>
          
          <RecipientsDialog accountId={account.id} />
          
          <SettingsDialog account={account} />

          <Button variant="ghost" size="icon" onClick={handleDelete} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function SettingsDialog({ account }: { account: any }) {
  const update = useUpdateAccount();
  const [template, setTemplate] = useState(account.messageTemplate || "");
  const [minDelay, setMinDelay] = useState(account.minDelaySeconds || 60);
  const [maxDelay, setMaxDelay] = useState(account.maxDelaySeconds || 180);

  const handleSave = async () => {
    await update.mutateAsync({ 
      id: account.id, 
      messageTemplate: template,
      minDelaySeconds: Number(minDelay),
      maxDelaySeconds: Number(maxDelay)
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 className="h-4 w-4 mr-2" /> Config
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-card border-border">
        <DialogHeader>
          <DialogTitle>Account Configuration</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label>Message Template</Label>
            <Textarea 
              placeholder="Hello {name}, ..."
              className="font-mono h-32"
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">This message will override any group templates.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="grid gap-2">
                <Label>Min Delay (sec)</Label>
                <Input type="number" value={minDelay} onChange={(e) => setMinDelay(e.target.value)} />
             </div>
             <div className="grid gap-2">
                <Label>Max Delay (sec)</Label>
                <Input type="number" value={maxDelay} onChange={(e) => setMaxDelay(e.target.value)} />
             </div>
          </div>

          <Button onClick={handleSave} disabled={update.isPending} className="ml-auto">
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
