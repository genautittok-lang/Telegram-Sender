import { useStats, useGlobalControl, useAccounts } from "@/hooks/use-telegram-api";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Play, Pause, Square, Activity, Users, Send, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { data: stats } = useStats();
  const { data: accounts } = useAccounts();
  const control = useGlobalControl();

  const handleGlobal = (action: 'start_all' | 'pause_all' | 'stop_all') => {
    if (confirm(`Are you sure you want to ${action.replace('_', ' ')}?`)) {
      control.mutate(action);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Global overview of your Telegram automation.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10"
            onClick={() => handleGlobal('start_all')}
            disabled={control.isPending}
          >
            <Play className="mr-2 h-4 w-4" /> Start All
          </Button>
          <Button 
            variant="outline" 
            className="border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/10"
            onClick={() => handleGlobal('pause_all')}
            disabled={control.isPending}
          >
            <Pause className="mr-2 h-4 w-4" /> Pause All
          </Button>
          <Button 
            variant="outline" 
            className="border-red-500/20 text-red-500 hover:bg-red-500/10"
            onClick={() => handleGlobal('stop_all')}
            disabled={control.isPending}
          >
            <Square className="mr-2 h-4 w-4" /> Stop All
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Accounts" 
          value={stats?.totalAccounts || 0} 
          icon={Users} 
          className="border-primary/20 bg-primary/5"
        />
        <StatCard 
          title="Active Sessions" 
          value={stats?.activeAccounts || 0} 
          icon={Activity} 
          className="border-emerald-500/20 bg-emerald-500/5"
        />
        <StatCard 
          title="Messages Sent" 
          value={stats?.messagesSent || 0} 
          icon={Send} 
          className="border-blue-500/20 bg-blue-500/5"
        />
        <StatCard 
          title="Recent Errors" 
          value={stats?.errors || 0} 
          icon={AlertTriangle} 
          className="border-red-500/20 bg-red-500/5"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Active Accounts</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts?.map((account) => (
            <Card key={account.id} className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-mono truncate">
                  {account.phoneNumber}
                </CardTitle>
                <StatusBadge status={account.status || 'idle'} />
              </CardHeader>
              <CardContent>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>Running</span>
                  </div>
                  <Progress value={account.status === 'sending' ? 66 : 0} className="h-1 bg-muted" />
                </div>
                {account.lastError && (
                   <p className="mt-4 text-xs text-red-400 truncate" title={account.lastError}>
                    Error: {account.lastError}
                   </p>
                )}
              </CardContent>
            </Card>
          ))}
          {!accounts?.length && (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-border rounded-lg text-muted-foreground">
              No accounts connected. Go to the Accounts page to add one.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ title, value, icon: Icon, className }: { title: string, value: number, icon: any, className?: string }) {
  return (
    <Card className={cn("border bg-card", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-mono">{value}</div>
      </CardContent>
    </Card>
  );
}
