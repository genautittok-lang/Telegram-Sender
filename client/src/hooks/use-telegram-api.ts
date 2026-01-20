import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { 
  CreateAccountGroupRequest, 
  UpdateAccountGroupRequest, 
  AuthSignInRequest, 
  AuthRequestCodeRequest,
  Account,
  AccountGroup,
  Recipient,
  Log
} from "@shared/schema";

// --- HOOKS FOR ACCOUNTS ---

export function useAccounts() {
  return useQuery({
    queryKey: [api.accounts.list.path],
    queryFn: async () => {
      const res = await fetch(api.accounts.list.path);
      if (!res.ok) throw new Error("Failed to fetch accounts");
      return api.accounts.list.responses[200].parse(await res.json());
    },
    refetchInterval: 5000, // Polling for status updates
  });
}

export function useAccount(id: number) {
  return useQuery({
    queryKey: [api.accounts.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.accounts.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Account not found");
      return api.accounts.get.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & any) => {
      const url = buildUrl(api.accounts.update.path, { id });
      const res = await fetch(url, {
        method: api.accounts.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update account");
      return api.accounts.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.accounts.list.path] });
      toast({ title: "Account updated" });
    },
    onError: (err) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    }
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.accounts.delete.path, { id });
      const res = await fetch(url, { method: api.accounts.delete.method });
      if (!res.ok) throw new Error("Failed to delete account");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.accounts.list.path] });
      toast({ title: "Account deleted" });
    },
  });
}

export function useControlAccount() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, action }: { id: number, action: 'start' | 'stop' }) => {
      const path = action === 'start' ? api.accounts.start.path : api.accounts.stop.path;
      const url = buildUrl(path, { id });
      const res = await fetch(url, { method: "POST" });
      if (!res.ok) throw new Error(`Failed to ${action} account`);
      return { success: true };
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: [api.accounts.list.path] });
      toast({ title: `Account ${action === 'start' ? 'started' : 'stopped'}` });
    },
  });
}

// --- HOOKS FOR GROUPS ---

export function useGroups() {
  return useQuery({
    queryKey: [api.groups.list.path],
    queryFn: async () => {
      const res = await fetch(api.groups.list.path);
      if (!res.ok) throw new Error("Failed to fetch groups");
      return api.groups.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateAccountGroupRequest) => {
      const res = await fetch(api.groups.create.path, {
        method: api.groups.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create group");
      return api.groups.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.groups.list.path] });
      toast({ title: "Group created" });
    },
  });
}

export function useUpdateGroup() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & UpdateAccountGroupRequest) => {
      const url = buildUrl(api.groups.update.path, { id });
      const res = await fetch(url, {
        method: api.groups.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update group");
      return api.groups.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.groups.list.path] });
      toast({ title: "Group updated" });
    },
  });
}

export function useDeleteGroup() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.groups.delete.path, { id });
      const res = await fetch(url, { method: api.groups.delete.method });
      if (!res.ok) throw new Error("Failed to delete group");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.groups.list.path] });
      toast({ title: "Group deleted" });
    },
  });
}

// --- HOOKS FOR RECIPIENTS ---

export function useRecipients(accountId: number) {
  return useQuery({
    queryKey: [api.recipients.list.path, accountId],
    queryFn: async () => {
      const url = buildUrl(api.recipients.list.path, { accountId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch recipients");
      return api.recipients.list.responses[200].parse(await res.json());
    },
  });
}

export function useBulkAddRecipients() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ accountId, identifiers }: { accountId: number, identifiers: string[] }) => {
      const url = buildUrl(api.recipients.bulkAdd.path, { accountId });
      const res = await fetch(url, {
        method: api.recipients.bulkAdd.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifiers }),
      });
      if (!res.ok) throw new Error("Failed to add recipients");
      return api.recipients.bulkAdd.responses[200].parse(await res.json());
    },
    onSuccess: (_, { accountId }) => {
      queryClient.invalidateQueries({ queryKey: [api.recipients.list.path, accountId] });
      toast({ title: "Recipients added successfully" });
    },
  });
}

export function useClearRecipients() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
  
    return useMutation({
      mutationFn: async ({ accountId }: { accountId: number }) => {
        const url = buildUrl(api.recipients.clear.path, { accountId });
        const res = await fetch(url, {
          method: api.recipients.clear.method,
        });
        if (!res.ok) throw new Error("Failed to clear recipients");
      },
      onSuccess: (_, { accountId }) => {
        queryClient.invalidateQueries({ queryKey: [api.recipients.list.path, accountId] });
        toast({ title: "Recipients cleared" });
      },
    });
}

// --- HOOKS FOR AUTH (TELEGRAM) ---

export function useRequestCode() {
  return useMutation({
    mutationFn: async (data: AuthRequestCodeRequest) => {
      const res = await fetch(api.auth.requestCode.path, {
        method: api.auth.requestCode.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to request code");
      }
      return api.auth.requestCode.responses[200].parse(await res.json());
    },
  });
}

export function useSignIn() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: AuthSignInRequest) => {
      const res = await fetch(api.auth.signIn.path, {
        method: api.auth.signIn.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to sign in");
      }
      return api.auth.signIn.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.accounts.list.path] });
      toast({ title: "Account connected successfully" });
    },
  });
}

export function useTestSms() {
  return useMutation({
    mutationFn: async ({ phoneNumber }: { phoneNumber: string }) => {
      const res = await fetch('/api/auth/test-sms', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Test failed");
      }
      return res.json();
    },
  });
}

// --- HOOKS FOR GLOBAL STATS & LOGS ---

export function useStats() {
  return useQuery({
    queryKey: [api.stats.get.path],
    queryFn: async () => {
      const res = await fetch(api.stats.get.path);
      if (!res.ok) throw new Error("Failed to fetch stats");
      return api.stats.get.responses[200].parse(await res.json());
    },
    refetchInterval: 5000,
  });
}

export function useLogs() {
  return useQuery({
    queryKey: [api.logs.list.path],
    queryFn: async () => {
      const res = await fetch(api.logs.list.path);
      if (!res.ok) throw new Error("Failed to fetch logs");
      return api.logs.list.responses[200].parse(await res.json());
    },
    refetchInterval: 2000,
  });
}

export function useGlobalControl() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (action: 'start_all' | 'stop_all' | 'pause_all') => {
      const res = await fetch(api.control.global.path, {
        method: api.control.global.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error("Command failed");
      return api.control.global.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.accounts.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.stats.get.path] });
      toast({ title: "Success", description: data.message });
    },
  });
}
