import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { format } from 'date-fns';
import { Shield, UserMinus, UserCheck, Ban, UserPlus, Trash2, Loader2, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

interface Profile {
  id: string;
  email: string;
  role: 'admin' | 'user';
  is_banned: boolean;
  last_login: string;
}

const AdminDashboardPage = () => {
  const { user, refreshRole } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dbRole, setDbRole] = useState<string | null>(null);

  const checkMyRole = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    setDbRole(data?.role || 'none');
  };

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      await checkMyRole();
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('last_login', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      console.error("Error fetching profiles:", error);
      // If we can't fetch, it's likely an RLS issue
    } finally {
      setLoading(false);
    }
  };

  const handleSyncProfile = async () => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-manage-users', {
        body: { action: 'sync-profile' }
      });

      if (error) throw error;
      
      showSuccess('Admin permissions synchronized with database');
      await refreshRole();
      await fetchProfiles();
    } catch (error: any) {
      showError('Failed to sync permissions: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('admin-manage-users', {
        body: { action: 'create', email: newEmail, password: newPassword }
      });

      if (error) throw error;
      
      showSuccess('User created successfully');
      setIsAddUserOpen(false);
      setNewEmail('');
      setNewPassword('');
      fetchProfiles();
    } catch (error: any) {
      showError(error.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase.functions.invoke('admin-manage-users', {
        body: { action: 'delete', userId }
      });

      if (error) throw error;
      
      showSuccess('User deleted successfully');
      fetchProfiles();
    } catch (error: any) {
      showError(error.message || 'Failed to delete user');
    }
  };

  const toggleBan = async (profile: Profile) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: !profile.is_banned })
      .eq('id', profile.id);

    if (error) showError('Failed to update user status');
    else {
      showSuccess(`User ${profile.is_banned ? 'unbanned' : 'banned'} successfully`);
      fetchProfiles();
    }
  };

  const toggleRole = async (profile: Profile) => {
    const newRole = profile.role === 'admin' ? 'user' : 'admin';
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', profile.id);

    if (error) showError('Failed to update user role');
    else {
      showSuccess(`User role updated to ${newRole}`);
      fetchProfiles();
    }
  };

  const isSyncNeeded = dbRole !== 'admin';

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" /> Admin Dashboard
          </h1>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchProfiles} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
              <DialogTrigger asChild>
                <Button disabled={isSyncNeeded}>
                  <UserPlus className="mr-2 h-4 w-4" /> Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddUser} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={newEmail} 
                      onChange={(e) => setNewEmail(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      required 
                      minLength={6}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create User
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {isSyncNeeded ? (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-semibold text-amber-900">Database Sync Required</p>
                  <p className="text-sm text-amber-800">
                    Your account is recognized as an admin, but your database profile needs to be updated to view the user list.
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleSyncProfile} 
                disabled={isSubmitting}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Sync Now
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="text-sm text-green-800 font-medium">
                Database permissions are active. You can now manage all users.
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : profiles.length <= 1 && isSyncNeeded ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Shield className="h-12 w-12 opacity-20" />
                        <p>Please click "Sync Now" above to view the full user list.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : profiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>{profile.email}</TableCell>
                    <TableCell>
                      <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'}>
                        {profile.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {profile.is_banned ? (
                        <Badge variant="destructive">Banned</Badge>
                      ) : (
                        <Badge variant="outline" className="text-green-600 border-green-600">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {profile.last_login ? format(new Date(profile.last_login), 'PPp') : 'Never'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => toggleRole(profile)}
                          title="Toggle Admin Role"
                        >
                          {profile.role === 'admin' ? <UserMinus className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </Button>
                        <Button 
                          variant={profile.is_banned ? "outline" : "destructive"} 
                          size="sm" 
                          onClick={() => toggleBan(profile)}
                          title={profile.is_banned ? "Unban User" : "Ban User"}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User Account?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the account for {profile.email}. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteUser(profile.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminDashboardPage;