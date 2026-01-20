import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRequestCode, useSignIn } from "@/hooks/use-telegram-api";
import { Loader2, Plus } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export function AddAccountDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    phoneNumber: "",
    apiId: "",
    apiHash: "",
    phoneCode: "",
    password: "",
  });
  const [phoneCodeHash, setPhoneCodeHash] = useState("");
  const { t } = useLanguage();

  const requestCode = useRequestCode();
  const signIn = useSignIn();

  const handleRequestCode = async () => {
    try {
      const res = await requestCode.mutateAsync({
        phoneNumber: formData.phoneNumber,
        apiId: parseInt(formData.apiId),
        apiHash: formData.apiHash,
      });
      setPhoneCodeHash(res.phoneCodeHash);
      setStep(2);
    } catch (e) {
      // Error handled in hook toast
    }
  };

  const handleSignIn = async () => {
    try {
      await signIn.mutateAsync({
        phoneNumber: formData.phoneNumber,
        phoneCode: formData.phoneCode,
        phoneCodeHash,
        apiId: parseInt(formData.apiId),
        apiHash: formData.apiHash,
        password: formData.password || undefined,
      });
      setOpen(false);
      setStep(1);
      setFormData({ phoneNumber: "", apiId: "", apiHash: "", phoneCode: "", password: "" });
    } catch (e) {
      // Error handled in hook toast
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
              <div className="grid gap-2">
                <Label htmlFor="apiId">{t('apiId')}</Label>
                <Input
                  id="apiId"
                  placeholder="123456"
                  value={formData.apiId}
                  onChange={(e) => setFormData({ ...formData, apiId: e.target.value })}
                  className="font-mono"
                  data-testid="input-api-id"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="apiHash">{t('apiHash')}</Label>
                <Input
                  id="apiHash"
                  placeholder="abcdef123456..."
                  value={formData.apiHash}
                  onChange={(e) => setFormData({ ...formData, apiHash: e.target.value })}
                  className="font-mono"
                  data-testid="input-api-hash"
                />
              </div>
              <Button 
                onClick={handleRequestCode} 
                disabled={requestCode.isPending || !formData.phoneNumber || !formData.apiId || !formData.apiHash}
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
