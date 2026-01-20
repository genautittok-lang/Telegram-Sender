import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRequestCode, useSignIn, useTestSms } from "@/hooks/use-telegram-api";
import { Loader2, Plus, CheckCircle, AlertCircle, QrCode, Phone, RefreshCw } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useQueryClient } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";

export function AddAccountDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [formData, setFormData] = useState({
    phoneNumber: "",
    phoneCode: "",
    password: "",
  });
  const [phoneCodeHash, setPhoneCodeHash] = useState("");
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  // QR Login state
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [qrId, setQrId] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrExpired, setQrExpired] = useState(false);

  const requestCode = useRequestCode();
  const signIn = useSignIn();
  const testSms = useTestSms();

  const handleTestSms = async () => {
    setTestResult(null);
    try {
      await testSms.mutateAsync({ phoneNumber: formData.phoneNumber });
      setTestResult('success');
    } catch (e) {
      setTestResult('error');
    }
  };

  const handleRequestCode = async () => {
    try {
      const res = await requestCode.mutateAsync({
        phoneNumber: formData.phoneNumber,
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
      handleClose();
    } catch (e) {
    }
  };

  const handleClose = () => {
    setOpen(false);
    setStep(1);
    setTestResult(null);
    setFormData({ phoneNumber: "", phoneCode: "", password: "" });
    setQrToken(null);
    setQrId(null);
    setQrExpired(false);
  };

  const generateQr = async () => {
    setQrLoading(true);
    setQrExpired(false);
    try {
      const res = await fetch('/api/auth/qr-generate', { method: 'POST' });
      if (!res.ok) throw new Error("Failed to generate QR");
      const data = await res.json();
      setQrToken(data.token);
      setQrId(data.qrId);
    } catch (e) {
      console.error(e);
    } finally {
      setQrLoading(false);
    }
  };

  // Poll for QR status
  useEffect(() => {
    if (!qrId || !open) return;
    
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/auth/qr-status/${qrId}`);
        const data = await res.json();
        
        if (data.status === 'success') {
          queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
          handleClose();
        } else if (data.status === 'expired') {
          setQrExpired(true);
          setQrToken(null);
        } else if (data.status === 'pending' && data.token) {
          // Update QR code with refreshed token
          setQrToken(data.token);
        }
      } catch (e) {
        console.error(e);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [qrId, open, queryClient]);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); else setOpen(true); }}>
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
        
        <Tabs defaultValue="phone" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="phone" className="gap-2" data-testid="tab-phone">
              <Phone className="h-4 w-4" /> {t('phoneNumber')}
            </TabsTrigger>
            <TabsTrigger value="qr" className="gap-2" data-testid="tab-qr">
              <QrCode className="h-4 w-4" /> {t('qrLogin')}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="phone" className="mt-4">
            <div className="grid gap-4">
              {step === 1 ? (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">{t('phoneNumber')}</Label>
                    <div className="flex gap-2">
                      <Input
                        id="phone"
                        placeholder="+380501234567"
                        value={formData.phoneNumber}
                        onChange={(e) => { setFormData({ ...formData, phoneNumber: e.target.value }); setTestResult(null); }}
                        className="font-mono flex-1"
                        data-testid="input-phone"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleTestSms}
                        disabled={testSms.isPending || !formData.phoneNumber}
                        className="whitespace-nowrap"
                        data-testid="button-test-sms"
                      >
                        {testSms.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : testResult === 'success' ? (
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                        ) : testResult === 'error' ? (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        ) : (
                          t('testNow')
                        )}
                      </Button>
                    </div>
                    {testResult === 'success' && (
                      <p className="text-xs text-emerald-500">{t('testSmsSuccess')}</p>
                    )}
                    {testResult === 'error' && (
                      <p className="text-xs text-destructive">{t('testSmsFailed')}</p>
                    )}
                  </div>
                  
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
          </TabsContent>
          
          <TabsContent value="qr" className="mt-4">
            <div className="flex flex-col items-center gap-4">
              {qrLoading ? (
                <div className="w-48 h-48 flex items-center justify-center bg-muted rounded-lg">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : qrToken ? (
                <>
                  <div className="p-4 bg-white rounded-lg">
                    <QRCodeSVG value={qrToken} size={180} data-testid="qr-code" />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    {t('scanQrCode')}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {t('waiting')}...
                  </div>
                </>
              ) : qrExpired ? (
                <div className="w-48 h-48 flex flex-col items-center justify-center bg-muted rounded-lg gap-3">
                  <p className="text-sm text-muted-foreground">QR expired</p>
                  <Button variant="outline" size="sm" onClick={generateQr} data-testid="button-refresh-qr">
                    <RefreshCw className="h-4 w-4 mr-2" /> Refresh
                  </Button>
                </div>
              ) : (
                <div className="w-48 h-48 flex items-center justify-center bg-muted rounded-lg">
                  <Button onClick={generateQr} data-testid="button-generate-qr">
                    <QrCode className="h-4 w-4 mr-2" /> {t('qrLogin')}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
