import React, { useState, useEffect } from 'react';
import { useNavigate } from '@/lib/next-router';
import { User, Mail, Phone, Lock, Camera, Save, ArrowLeft, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import PageMeta from '@/components/common/PageMeta';

const AccountSettings: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEngineer, setIsEngineer] = useState(false);
  const [authLoaded, setAuthLoaded] = useState(false);

  const userRole = isAdmin ? 'Administrator' : isEngineer ? 'Engineering Professional' : 'Guest';

  // Form State
  const [profile, setProfile] = useState({
    name: 'Guest User',
    email: 'guest@example.com',
    phone: '+91 98765 43210',
    avatar: '',
    notifications: true,
    twoFactor: false
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  useEffect(() => {
    const admin = !!localStorage.getItem('vts_admin_auth');
    const engineer = !!localStorage.getItem('vts_engineer_auth');
    setIsAdmin(admin);
    setIsEngineer(engineer);
    setProfile((currentProfile) => ({
      ...currentProfile,
      name: localStorage.getItem('vts_admin_name') || localStorage.getItem('vts_engineer_name') || 'Guest User',
      email: localStorage.getItem('vts_admin_email') || localStorage.getItem('vts_engineer_email') || 'guest@example.com',
    }));
    setAuthLoaded(true);
  }, []);

  useEffect(() => {
    if (!authLoaded) return;
    if (!isAdmin && !isEngineer) {
      navigate('/');
    }
  }, [authLoaded, isAdmin, isEngineer, navigate]);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API Call
    setTimeout(() => {
      if (isAdmin) {
        localStorage.setItem('vts_admin_name', profile.name);
      } else {
        localStorage.setItem('vts_engineer_name', profile.name);
      }

      setIsLoading(false);
      toast({
        title: "Profile Updated",
        description: "Your personal information has been successfully saved.",
      });
    }, 1500);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast({
        variant: "destructive",
        title: "Passwords Mismatch",
        description: "New password and confirmation do not match.",
      });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setPasswords({ current: '', new: '', confirm: '' });
      toast({
        title: "Password Changed",
        description: "Your security credentials have been updated.",
      });
    }, 1500);
  };

  return (
    <>
      <PageMeta
        title="Account Settings - VedTech Services"
        description="Manage your profile, security, and preferences on VedTech Services."
      />
      <div className="flex flex-col w-full min-h-screen bg-slate-50/50">
        {/* Header Section */}
        <section className="bg-slate-900 text-white py-12 md:py-16">
          <div className="container">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <Button variant="ghost" onClick={() => navigate(-1)} className="text-slate-400 hover:text-white -ml-4">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <h1 className="text-3xl md:text-4xl font-bold">Account Settings</h1>
                <p className="text-slate-400">Manage your profile, security, and preferences</p>
              </div>
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl backdrop-blur">
                <Avatar className="h-16 w-16 border-2 border-primary">
                  <AvatarImage src={profile.avatar} />
                  <AvatarFallback className="bg-primary/20 text-primary font-bold text-xl">
                    {profile.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-lg">{profile.name}</p>
                  <p className="text-sm text-primary uppercase tracking-wider font-semibold">{userRole}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Settings Content */}
        <section className="py-12">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Sidebar Navigation (Visual only for now) */}
              <div className="lg:col-span-3 space-y-2">
                <Button variant="ghost" className="w-full justify-start font-bold bg-white shadow-sm border text-primary">
                  <User className="mr-3 h-4 w-4" /> Personal Information
                </Button>
                <Button variant="ghost" className="w-full justify-start text-slate-600 hover:bg-slate-100">
                  <Lock className="mr-3 h-4 w-4" /> Password & Security
                </Button>
                <Button variant="ghost" className="w-full justify-start text-slate-600 hover:bg-slate-100">
                  <Shield className="mr-3 h-4 w-4" /> Two-Factor Auth
                </Button>
                <Button variant="ghost" className="w-full justify-start text-slate-600 hover:bg-slate-100">
                  <AlertCircle className="mr-3 h-4 w-4" /> Notification Settings
                </Button>
              </div>

              {/* Form Content */}
              <div className="lg:col-span-9 space-y-8">
                {/* Profile Section */}
                <Card className="shadow-sm border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>Update your public profile and contact details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileSave} className="space-y-6">
                      <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="relative group">
                          <Avatar className="h-32 w-32 border-4 border-slate-100 shadow-md">
                            <AvatarImage src={profile.avatar} />
                            <AvatarFallback className="text-4xl">{profile.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <button type="button" className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:scale-110 transition-transform">
                            <Camera className="h-5 w-5" />
                          </button>
                        </div>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                          <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                              id="fullName"
                              value={profile.name}
                              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                              placeholder="Enter your name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                              id="email"
                              type="email"
                              value={profile.email}
                              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                              placeholder="your@email.com"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              value={profile.phone}
                              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                              placeholder="+91 00000 00000"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="role">Current Role (Read-only)</Label>
                            <Input id="role" value={userRole} readOnly className="bg-slate-50 border-slate-100 text-slate-500" />
                          </div>
                        </div>
                      </div>
                      <div className="pt-4 flex justify-end">
                        <Button type="submit" disabled={isLoading} className="px-8 font-bold">
                          {isLoading ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {/* Password Section */}
                <Card className="shadow-sm border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5 text-primary" />
                      Security Credentials
                    </CardTitle>
                    <CardDescription>Change your password to keep your account secure</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="currPass">Current Password</Label>
                        <Input
                          id="currPass"
                          type="password"
                          value={passwords.current}
                          onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPass">New Password</Label>
                        <Input
                          id="newPass"
                          type="password"
                          value={passwords.new}
                          onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confPass">Confirm Password</Label>
                        <Input
                          id="confPass"
                          type="password"
                          value={passwords.confirm}
                          onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="md:col-span-3 pt-2 flex justify-end">
                        <Button type="submit" disabled={isLoading} variant="secondary" className="px-8 font-bold">
                          {isLoading ? "Updating..." : "Update Password"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {/* Preferences Section */}
                <Card className="shadow-sm border-slate-200">
                  <CardHeader>
                    <CardTitle>System Preferences</CardTitle>
                    <CardDescription>Customize your notification and security settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Email Notifications</Label>
                        <p className="text-sm text-slate-500">Receive alerts about new tickets and system status</p>
                      </div>
                      <Switch
                        checked={profile.notifications}
                        onCheckedChange={(checked) => setProfile({ ...profile, notifications: checked })}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Label className="text-base">Two-Factor Authentication</Label>
                          <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">Recommended</Badge>
                        </div>
                        <p className="text-sm text-slate-500">Add an extra layer of security to your account</p>
                      </div>
                      <Switch
                        checked={profile.twoFactor}
                        onCheckedChange={(checked) => setProfile({ ...profile, twoFactor: checked })}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="bg-slate-50 p-4 border-t flex items-center gap-2 text-primary font-semibold text-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    All settings are synced across your devices
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AccountSettings;
