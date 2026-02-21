import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { format } from 'date-fns';
import { Shield, UserMinus, UserCheck, Ban } from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  role: 'admin' | 'user';
  is_banned: boolean;
  last_login: string;
}

const AdminDashboardPage = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('last_login', { ascending: false });

    if (error) showError('Failed to fetch users');
    else setProfiles(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

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

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" /> Admin Dashboard
        </h1>

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
                {profiles.map((profile) => (
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