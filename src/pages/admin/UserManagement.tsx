import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AdminRoute } from "@/components/AdminRoute";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Shield, User, MoreVertical, Trash2, UserCog, UserPlus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AddUserDialog } from "@/components/AddUserDialog";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserPermissions {
  canCreate: boolean;
  canDelete: boolean;
  canArchive: boolean;
}

interface UserWithRole {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: AppRole;
  user_id: string;
  permissions: UserPermissions;
}

const UserManagement = () => {
  const { organization, user: currentUser } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  const fetchUsers = async () => {
    if (!organization) return;

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, organization_id")
      .eq("organization_id", organization.id);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      return;
    }

    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id, role")
      .eq("organization_id", organization.id);

    if (rolesError) {
      console.error("Error fetching roles:", rolesError);
      return;
    }

    const usersWithRoles: UserWithRole[] = profiles.map((profile) => {
      const userRole = roles.find((r) => r.user_id === profile.id);
      // Default permissions - admins have all, employees have none (for now)
      const isAdmin = userRole?.role === "admin";
      return {
        id: profile.id,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        role: userRole?.role || "employee",
        user_id: profile.id,
        permissions: {
          canCreate: isAdmin,
          canDelete: isAdmin,
          canArchive: isAdmin,
        },
      };
    });

    setUsers(usersWithRoles);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [organization]);

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    if (!organization) return;

    const { error } = await supabase
      .from("user_roles")
      .update({ role: newRole })
      .eq("user_id", userId)
      .eq("organization_id", organization.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      });
      fetchUsers();
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId || !organization) return;

    setIsDeleting(true);

    try {
      // Delete user role first (due to foreign key constraints)
      const { error: roleError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", deleteUserId)
        .eq("organization_id", organization.id);

      if (roleError) throw roleError;

      // Delete profile
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", deleteUserId);

      if (profileError) throw profileError;

      toast({
        title: "User deleted",
        description: "The user has been removed from the organization",
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteUserId(null);
    }
  };

  const handlePermissionChange = (userId: string, permission: 'canCreate' | 'canDelete' | 'canArchive', value: boolean) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId 
          ? { ...user, permissions: { ...user.permissions, [permission]: value } }
          : user
      )
    );
    toast({
      title: "Permission updated",
      description: "Permission changes will be persisted once the database is set up.",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const userToDelete = users.find(u => u.id === deleteUserId);

  return (
    <AdminRoute>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground">User Management</h1>
              <p className="text-muted-foreground mt-1">
                Manage users in {organization?.name}
              </p>
            </div>
            <Button className="gap-2" onClick={() => setIsAddUserOpen(true)}>
              <UserPlus className="w-4 h-4" />
              Add User
            </Button>
          </div>

          {/* Users List */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/30">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground">
                <div className="col-span-4">User</div>
                <div className="col-span-2">Role</div>
                <div className="col-span-5">Permissions</div>
                <div className="col-span-1"></div>
              </div>
            </div>

            {isLoading ? (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No users found</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {users.map((user) => (
                  <div key={user.id} className="px-6 py-4 hover:bg-muted/20 transition-colors">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-4 flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(user.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{user.full_name}</p>
                          {user.id === currentUser?.id && (
                            <span className="text-xs text-muted-foreground">(You)</span>
                          )}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {user.role === "admin" ? (
                            <Shield className="w-3 h-3" />
                          ) : (
                            <User className="w-3 h-3" />
                          )}
                          {user.role === "admin" ? "Admin" : "Employee"}
                        </span>
                      </div>
                      <div className="col-span-5">
                        <div className="flex items-center gap-6">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs text-muted-foreground">Create</span>
                            <Switch
                              checked={user.permissions.canCreate}
                              disabled={user.id === currentUser?.id}
                              onCheckedChange={(checked) => handlePermissionChange(user.id, 'canCreate', checked)}
                            />
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs text-muted-foreground">Delete</span>
                            <Switch
                              checked={user.permissions.canDelete}
                              disabled={user.id === currentUser?.id}
                              onCheckedChange={(checked) => handlePermissionChange(user.id, 'canDelete', checked)}
                            />
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs text-muted-foreground">Archive</span>
                            <Switch
                              checked={user.permissions.canArchive}
                              disabled={user.id === currentUser?.id}
                              onCheckedChange={(checked) => handlePermissionChange(user.id, 'canArchive', checked)}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-span-1 flex justify-end">
                        {user.id !== currentUser?.id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover">
                              <DropdownMenuItem
                                onClick={() => handleRoleChange(
                                  user.id,
                                  user.role === "admin" ? "employee" : "admin"
                                )}
                                className="gap-2"
                              >
                                <UserCog className="w-4 h-4" />
                                {user.role === "admin" ? "Demote to Employee" : "Promote to Admin"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDeleteUserId(user.id)}
                                className="gap-2 text-destructive focus:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteUserId} onOpenChange={(open) => !open && setDeleteUserId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete User</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <strong>{userToDelete?.full_name}</strong>? 
                This action cannot be undone and will remove all their data from the organization.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteUser}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? (
                  <div className="w-4 h-4 border-2 border-destructive-foreground/30 border-t-destructive-foreground rounded-full animate-spin" />
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Add User Dialog */}
        <AddUserDialog
          open={isAddUserOpen}
          onOpenChange={setIsAddUserOpen}
          onUserAdded={fetchUsers}
        />
      </DashboardLayout>
    </AdminRoute>
  );
};

export default UserManagement;
