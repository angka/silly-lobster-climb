import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Edit, Trash2, UserPlus, KeyRound } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/SessionContextProvider';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
}

interface AdminPageProps {
  onLogout: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ onLogout }) => {
  const { session, isLoading: sessionLoading } = useSession();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPasswordResetDialogOpen, setIsPasswordResetDialogOpen] = useState(false);

  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserFirstName, setNewUserFirstName] = useState('');
  const [newUserLastName, setNewUserLastName] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');

  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editingUserFirstName, setEditingUserFirstName] = useState('');
  const [editingUserLastName, setEditingUserLastName] = useState('');
  const [editingUserRole, setEditingUserRole] = useState('');

  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [userToResetPassword, setUserToResetPassword] = useState<UserProfile | null>(null);
  const [newPasswordForReset, setNewPasswordForReset] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, role');

    if (profilesError) {
      showError(`Error fetching profiles: ${profilesError.message}`);
      setLoading(false);
      return;
    }

    // Fetch auth.users to get emails
    const { data: authUsers, error: authUsersError } = await supabase.auth.admin.listUsers();

    if (authUsersError) {
      showError(`Error fetching auth users: ${authUsersError.message}`);
      setLoading(false);
      return;
    }

    const combinedUsers: UserProfile[] = profiles.map(profile => {
      const authUser = authUsers.users.find(u => u.id === profile.id);
      return {
        id: profile.id,
        email: authUser?.email || 'N/A',
        first_name: profile.first_name,
        last_name: profile.last_name,
        role: profile.role,
      };
    });

    setUsers(combinedUsers);
    setLoading(false);
  };

  useEffect(() => {
    if (!sessionLoading && session) {
      // Check if the current user is an admin
      supabase.from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()
        .then(({ data, error }) => {
          if (error || data?.role !== 'admin') {
            showError('Access Denied: You must be an administrator to view this page.');
            navigate('/dashboard'); // Redirect non-admins
          } else {
            fetchUsers();
          }
        });
    } else if (!sessionLoading && !session) {
      navigate('/login'); // Redirect if not authenticated
    }
  }, [session, sessionLoading, navigate]);

  const handleAddUser = async () => {
    if (!newUserEmail || !newUserPassword) {
      showError('Email and password are required.');
      return;
    }

    const { data: user, error: authError } = await supabase.auth.admin.createUser({
      email: newUserEmail,
      password: newUserPassword,
      email_confirm: true, // Automatically confirm email
      user_metadata: {
        first_name: newUserFirstName,
        last_name: newUserLastName,
        role: newUserRole,
      },
    });

    if (authError) {
      showError(`Error adding user: ${authError.message}`);
      return;
    }

    // The handle_new_user trigger should create the profile, but we can also update it here if needed
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({ role: newUserRole, first_name: newUserFirstName, last_name: newUserLastName })
      .eq('id', user?.user?.id);

    if (profileUpdateError) {
      showError(`Error updating user profile: ${profileUpdateError.message}`);
      return;
    }

    showSuccess('User added successfully!');
    setIsAddUserDialogOpen(false);
    setNewUserEmail('');
    setNewUserPassword('');
    setNewUserFirstName('');
    setNewUserLastName('');
    setNewUserRole('user');
    fetchUsers();
  };

  const handleEditUser = async () => {
    if (!editingUser) return;

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        first_name: editingUserFirstName,
        last_name: editingUserLastName,
        role: editingUserRole,
        updated_at: new Date().toISOString(),
      })
      .eq('id', editingUser.id);

    if (profileError) {
      showError(`Error updating user profile: ${profileError.message}`);
      return;
    }

    showSuccess('User updated successfully!');
    setIsEditDialogOpen(false);
    setEditingUser(null);
    fetchUsers();
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    const { error } = await supabase.auth.admin.deleteUser(userToDelete.id);

    if (error) {
      showError(`Error deleting user: ${error.message}`);
      return;
    }

    showSuccess('User deleted successfully!');
    setIsDeleteDialogOpen(false);
    setUserToDelete(null);
    fetchUsers();
  };

  const handlePasswordReset = async () => {
    if (!userToResetPassword || !newPasswordForReset) {
      showError('User and new password are required.');
      return;
    }

    const { error } = await supabase.auth.admin.updateUserById(userToResetPassword.id, {
      password: newPasswordForReset,
    });

    if (error) {
      showError(`Error resetting password: ${error.message}`);
      return;
    }

    showSuccess('Password reset successfully!');
    setIsPasswordResetDialogOpen(false);
    setUserToResetPassword(null);
    setNewPasswordForReset('');
  };

  if (loading || sessionLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <p className="text-xl text-gray-600">Loading admin panel...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Panel - User Management</h1>
          <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" /> Add New User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">Email</Label>
                  <Input id="email" type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">Password</Label>
                  <Input id="password" type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="firstName" className="text-right">First Name</Label>
                  <Input id="firstName" value={newUserFirstName} onChange={(e) => setNewUserFirstName(e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="lastName" className="text-right">Last Name</Label>
                  <Input id="lastName" value={newUserLastName} onChange={(e) => setNewUserLastName(e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">Role</Label>
                  <Select value={newUserRole} onValueChange={setNewUserRole}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleAddUser}>Add User</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>First Name</TableHead>
                <TableHead>Last Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{user.first_name || 'N/A'}</TableCell>
                    <TableCell>{user.last_name || 'N/A'}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingUser(user);
                            setEditingUserFirstName(user.first_name || '');
                            setEditingUserLastName(user.last_name || '');
                            setEditingUserRole(user.role);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit {user.email}</span>
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setUserToResetPassword(user);
                            setNewPasswordForReset('');
                            setIsPasswordResetDialogOpen(true);
                          }}
                        >
                          <KeyRound className="h-4 w-4" />
                          <span className="sr-only">Reset Password for {user.email}</span>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setUserToDelete(user);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete {user.email}</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User: {editingUser?.email}</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editFirstName" className="text-right">First Name</Label>
                <Input id="editFirstName" value={editingUserFirstName} onChange={(e) => setEditingUserFirstName(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editLastName" className="text-right">Last Name</Label>
                <Input id="editLastName" value={editingUserLastName} onChange={(e) => setEditingUserLastName(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editRole" className="text-right">Role</Label>
                <Select value={editingUserRole} onValueChange={setEditingUserRole}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button type="submit" onClick={handleEditUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={isPasswordResetDialogOpen} onOpenChange={setIsPasswordResetDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reset Password for {userToResetPassword?.email}</DialogTitle>
          </DialogHeader>
          {userToResetPassword && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="newPassword" className="text-right">New Password</Label>
                <Input id="newPassword" type="password" value={newPasswordForReset} onChange={(e) => setNewPasswordForReset(e.target.value)} className="col-span-3" required />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsPasswordResetDialogOpen(false)}>Cancel</Button>
            <Button type="submit" onClick={handlePasswordReset}>Reset Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Alert Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              <span className="font-bold"> {userToDelete?.email} </span>
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default AdminPage;