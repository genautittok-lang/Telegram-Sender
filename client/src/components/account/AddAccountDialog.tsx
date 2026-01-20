import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRequestCode, useSignIn } from "@/hooks/use-telegram-api";
import { Loader2, Plus, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function AddAccountDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [showApiFields, setShowApiFields] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: "",
    phoneCode: "",
    password: "",
    apiId: "",
    apiHash: "",
  });
  const [phoneCodeHash, setPhoneCodeHash] = useState("");
  const { t } = useLanguage();

  const requestCode = useRequestCode();
  const signIn = useSignIn();

  const handleRequestCode = async () => {
    try {
      const res = await requestCode.mutateAsync({
        phoneNumber: formData.phoneNumber,
        apiId: formData.apiId ? parseInt(formData.apiId) : undefined,
        apiHash: formData.apiHash || undefined,
      });
      setPhoneCodeHash(res.phoneCodeHash);
      setStep(2);
    } catch (e) {
    }
  };

  const handleSignIn = async () => {
    try {
      await signIn.mutateAsync({
        phoneNumber: formData.phoneNumber,
        phoneCode: formData.phoneCode,
        phoneCodeHash,
        password: formData.password || undefined,
      });
      setOpen(false);
      setStep(1);
      setShowApiFields(false);
      setFormData({ phoneNumber: "", phoneCode: "", password: "", apiId: "", apiHash: "" });
    } catch (e) {
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary hover:bg-primary/90" data-testid="button-add-account">
          <Plus className="h-4 w-4" /> {t('addAccount')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle>{t('connectTelegram')}</DialogTitle>
          <DialogDescription className="sr-only">
            {t('addAccount')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {step === 1 ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor="phone">{t('phoneNumber')}</Label>
                <Input
                  id="phone"
                  placeholder="+380501234567"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="font-mono"
                  data-testid="input-phone"
                />
              </div>
              
              <Collapsible open={showApiFields} onOpenChange={setShowApiFields}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-between text-muted-foreground" data-testid="button-toggle-api">
                    {t('apiCredentials')}
                    {showApiFields ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 pt-2">
                  <div className="flex items-start gap-2 p-2 rounded-md bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-xs">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{t('apiCredentialsHint')}</span>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="apiId">API ID</Label>
                    <Input
                      id="apiId"
                      placeholder="12345678"
                      value={formData.apiId}
                      onChange={(e) => setFormData({ ...formData, apiId: e.target.value })}
                      className="font-mono"
                      data-testid="input-api-id"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="apiHash">API Hash</Label>
                    <Input
                      id="apiHash"
                      placeholder="abc123def456..."
                      value={formData.apiHash}
                      onChange={(e) => setFormData({ ...formData, apiHash: e.target.value })}
                      className="font-mono"
                      data-testid="input-api-hash"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <a 
                      href="https://my.telegram.org/apps" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      my.telegram.org/apps
                    </a>
                  </p>
                </CollapsibleContent>
              </Collapsible>
              
              <Button 
                onClick={handleRequestCode} 
                disabled={requestCode.isPending || !formData.phoneNumber}
                data-testid="button-send-code"
              >
                {requestCode.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('sendCode')}
              </Button>
            </>
          ) : (
            <>
              <div className="bg-muted p-3 rounded-md text-sm text-muted-foreground mb-2">
                {t('codeSentTo')} {formData.phoneNumber}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="code">{t('telegramCode')}</Label>
                <Input
                  id="code"
                  placeholder="12345"
                  value={formData.phoneCode}
                  onChange={(e) => setFormData({ ...formData, phoneCode: e.target.value })}
                  className="font-mono tracking-widest text-center text-lg"
                  data-testid="input-code"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">{t('twoFactorPassword')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  data-testid="input-password"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => setStep(1)}
                  data-testid="button-back"
                >
                  {t('back')}
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={handleSignIn}
                  disabled={signIn.isPending || !formData.phoneCode}
                  data-testid="button-verify"
                >
                  {signIn.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('verifyConnect')}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
