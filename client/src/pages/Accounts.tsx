import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { AddAccountDialog } from "@/components/account/AddAccountDialog";
import { RecipientsDialog } from "@/components/account/RecipientsDialog";
import { useAccounts, useControlAccount, useDeleteAccount, useUpdateAccount } from "@/hooks/use-telegram-api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Play, Pause, Trash2, Settings2, Save, Clock, Send, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useLanguage } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";

const DAYS = [
  { key: 'mon', label: 'monday' },
  { key: 'tue', label: 'tuesday' },
  { key: 'wed', label: 'wednesday' },
  { key: 'thu', label: 'thursday' },
  { key: 'fri', label: 'friday' },
  { key: 'sat', label: 'saturday' },
  { key: 'sun', label: 'sunday' },
] as const;

export default function Accounts() {
  const { data: accounts, isLoading } = useAccounts();
  const { t } = useLanguage();

  return (
    <Layout>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('accounts')}</h2>
          <p className="text-muted-foreground">{t('manageAccounts')}</p>
        </div>
        <AddAccountDialog />
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-muted-foreground">{t('loadingAccounts')}</div>
        ) : (
          accounts?.map((account) => (
            <AccountRow key={account.id} account={account} />
          ))
        )}
        {!isLoading && accounts?.length === 0 && (
          <div className="text-center py-24 text-muted-foreground border-2 border-dashed border-border rounded-xl">
            {t('noAccountsFound')}
          </div>
        )}
      </div>
    </Layout>
  );
}

function AccountRow({ account }: { account: any }) {
  const control = useControlAccount();
  const deleteAccount = useDeleteAccount();
  const { t } = useLanguage();

  const toggleRun = () => {
    const action = account.isRunning ? 'stop' : 'start';
    control.mutate({ id: account.id, action });
  };

  const handleDelete = () => {
    if (confirm(t('deleteConfirm'))) {
      deleteAccount.mutate(account.id);
    }
  };

  return (
    <Card className="overflow-hidden border-border bg-card hover:bg-muted/10 transition-colors">
      <div className="flex flex-col md:flex-row items-start md:items-center p-6 gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-lg font-mono font-medium">{account.phoneNumber}</h3>
            <StatusBadge status={account.status || 'idle'} />
            {account.scheduleType && account.scheduleType !== 'manual' && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {account.scheduleType === 'daily' ? t('daily') : t('weekly')} {account.scheduleTime}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            {t('added')} {account.createdAt ? format(new Date(account.createdAt), 'PP') : '-'}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleRun}
            className={account.isRunning ? "border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10" : "border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10"}
            data-testid={`button-toggle-${account.id}`}
          >
            {account.isRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {account.isRunning ? t('pause') : t('start')}
          </Button>
          
          <RecipientsDialog accountId={account.id} />
          
          <SettingsDialog account={account} />

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleDelete} 
            className="text-muted-foreground hover:text-destructive"
            data-testid={`button-delete-${account.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function SettingsDialog({ account }: { account: any }) {
  const update = useUpdateAccount();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [template, setTemplate] = useState(account.messageTemplate || "");
  const [scheduleType, setScheduleType] = useState(account.scheduleType || "manual");
  const [scheduleTime, setScheduleTime] = useState(account.scheduleTime || "09:00");
  const [scheduleDays, setScheduleDays] = useState<string[]>(account.scheduleDays || []);
  const [testPhone, setTestPhone] = useState("");
  const [testLoading, setTestLoading] = useState(false);

  const handleSave = async () => {
    await update.mutateAsync({ 
      id: account.id, 
      messageTemplate: template,
      scheduleType,
      scheduleTime,
      scheduleDays
    });
  };

  const handleTestMessage = async () => {
    if (!testPhone.trim()) return;
    setTestLoading(true);
    try {
      const res = await fetch(`/api/accounts/${account.id}/test-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: testPhone.trim(), message: template || 'Test message' })
      });
      if (res.ok) {
        toast({ title: t('testMessageSuccess') });
        setTestPhone("");
      } else {
        const data = await res.json();
        toast({ title: t('testMessageFailed'), description: data.message, variant: 'destructive' });
      }
    } catch (e: any) {
      toast({ title: t('testMessageFailed'), description: e.message, variant: 'destructive' });
    } finally {
      setTestLoading(false);
    }
  };

  const toggleDay = (day: string) => {
    setScheduleDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" data-testid={`button-config-${account.id}`}>
          <Settings2 className="h-4 w-4 mr-2" /> {t('config')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('accountConfig')}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label>{t('messageTemplate')}</Label>
            <Textarea 
              placeholder="Hello! ..."
              className="font-mono h-32"
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              data-testid="textarea-message-template"
            />
            <p className="text-xs text-muted-foreground">{t('templateOverride')}</p>
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
              <Send className="h-4 w-4" /> {t('testMessage')}
            </h4>
            <div className="grid gap-4">
              <p className="text-xs text-muted-foreground">{t('testMessageHint')}</p>
              <div className="flex gap-2">
                <Input 
                  placeholder="+7 999 123 4567"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  className="flex-1 font-mono"
                  data-testid="input-test-phone"
                />
                <Button 
                  onClick={handleTestMessage}
                  disabled={testLoading || !testPhone.trim()}
                  data-testid="button-send-test"
                >
                  {testLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                  {t('sendTestMessage')}
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4" /> {t('schedule')}
              <span className="text-xs text-muted-foreground font-normal">({t('kyivTime')})</span>
            </h4>
            
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>{t('scheduleType')}</Label>
                <Select value={scheduleType} onValueChange={setScheduleType}>
                  <SelectTrigger data-testid="select-schedule-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">{t('manual')}</SelectItem>
                    <SelectItem value="daily">{t('daily')}</SelectItem>
                    <SelectItem value="weekly">{t('weekly')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {scheduleType !== 'manual' && (
                <div className="grid gap-2">
                  <Label>{t('scheduleTime')}</Label>
                  <Input 
                    type="time" 
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    data-testid="input-schedule-time"
                  />
                </div>
              )}

              {scheduleType === 'weekly' && (
                <div className="grid gap-2">
                  <Label>{t('scheduleDays')}</Label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map(day => (
                      <label 
                        key={day.key}
                        className="flex items-center gap-2 px-3 py-2 rounded-md border border-border cursor-pointer hover:bg-muted transition-colors"
                      >
                        <Checkbox 
                          checked={scheduleDays.includes(day.key)}
                          onCheckedChange={() => toggleDay(day.key)}
                          data-testid={`checkbox-day-${day.key}`}
                        />
                        <span className="text-sm">{t(day.label as any)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={update.isPending} 
            className="ml-auto"
            data-testid="button-save-config"
          >
            <Save className="mr-2 h-4 w-4" /> {t('saveChanges')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
