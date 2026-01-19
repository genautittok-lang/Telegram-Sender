import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useGroups, useCreateGroup, useUpdateGroup, useDeleteGroup } from "@/hooks/use-telegram-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Layers } from "lucide-react";
import { format } from "date-fns";

export default function Groups() {
  const { data: groups, isLoading } = useGroups();

  return (
    <Layout>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Account Groups</h2>
          <p className="text-muted-foreground">Organize accounts and share message templates.</p>
        </div>
        <CreateGroupDialog />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div>Loading groups...</div>
        ) : (
          groups?.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))
        )}
      </div>
    </Layout>
  );
}

function GroupCard({ group }: { group: any }) {
  const deleteGroup = useDeleteGroup();

  const handleDelete = () => {
    if (confirm(`Delete group "${group.name}"?`)) {
      deleteGroup.mutate(group.id);
    }
  };

  return (
    <Card className="bg-card border-border relative group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            <CardTitle className="text-lg font-medium">{group.name}</CardTitle>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <CreateGroupDialog group={group} trigger={
                <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-3 w-3" /></Button>
            } />
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={handleDelete}>
                <Trash2 className="h-3 w-3" />
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mt-4">
          <p className="text-xs text-muted-foreground font-mono mb-2">Message Template:</p>
          <div className="bg-muted p-3 rounded-md text-xs font-mono text-muted-foreground line-clamp-3 h-16">
            {group.messageTemplate || "No template set"}
          </div>
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          Created {group.createdAt ? format(new Date(group.createdAt), 'PP') : '-'}
        </div>
      </CardContent>
    </Card>
  );
}

function CreateGroupDialog({ group, trigger }: { group?: any, trigger?: React.ReactNode }) {
  const create = useCreateGroup();
  const update = useUpdateGroup();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(group?.name || "");
  const [template, setTemplate] = useState(group?.messageTemplate || "");

  const handleSubmit = async () => {
    if (group) {
      await update.mutateAsync({ id: group.id, name, messageTemplate: template });
    } else {
      await create.mutateAsync({ name, messageTemplate: template });
    }
    setOpen(false);
    if (!group) { setName(""); setTemplate(""); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button className="gap-2"><Plus className="h-4 w-4" /> Create Group</Button>}
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>{group ? "Edit Group" : "Create Group"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Marketing Team A" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Shared Message Template</label>
            <Textarea 
                value={template} 
                onChange={(e) => setTemplate(e.target.value)} 
                placeholder="Hi {name}, checking in..."
                className="font-mono h-32" 
            />
          </div>
          <Button onClick={handleSubmit} disabled={!name}>
            {group ? "Save Changes" : "Create Group"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
