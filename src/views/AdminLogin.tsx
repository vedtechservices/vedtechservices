import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Shield, Lock, Key } from 'lucide-react';
import { useNavigate } from '@/lib/next-router';
import { LoadingSpinner } from '@/components/common/Loader';
import { useToast } from '@/hooks/use-toast';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotDialog, setShowForgotDialog] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [isResetting, setIsResetting] = useState(false);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      await completeLogin();
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred during admin authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const completeLogin = async (totp?: string) => {
    const sessionResponse = await fetch('/api/admin/session', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, totp }),
    });
    const sessionResult = await sessionResponse.json();
    if (sessionResult.requiresTotp) {
      setError(sessionResult.error || 'Enter your authenticator code.');
      setShow2FADialog(true);
      return;
    }
    if (!sessionResponse.ok || !sessionResult.success) {
      setError(sessionResult.error || 'Could not establish a secure admin session.');
      return;
    }
    const admin = sessionResult.admin;
    localStorage.setItem('vts_admin_auth', 'true');
    localStorage.setItem('vts_admin_email', admin.email);
    localStorage.setItem('vts_admin_id', admin.id);
    localStorage.setItem('vts_admin_role', admin.role);
    setShow2FADialog(false);
    
    toast({
      title: "Login Successful",
      description: `Welcome back to the Admin Panel, ${admin.full_name}!`,
    });
    
    navigate('/admin/dashboard');
  };

  const verify2FA = async () => {
    setIsLoading(true);
    try {
      await completeLogin(totpCode);
    } catch {
      toast({
        title: "Authentication Failed",
        description: "Could not verify the code.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestReset = async () => {
    if (!resetEmail) return;
    setIsResetting(true);
    try {
      const response = await fetch('/api/admin/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request', email: resetEmail }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not send the verification code.');
      toast({ title: "Check Your Email", description: result.message });
      setStep('verify');
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to send reset code", variant: "destructive" });
    } finally {
      setIsResetting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetCode || !newPassword) return;
    setIsResetting(true);
    try {
      const response = await fetch('/api/admin/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset', email: resetEmail, code: resetCode, newPassword }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not update the password.');
      toast({ title: "Password Updated", description: result.message });
      setShowForgotDialog(false);
      setStep('request');
      setResetCode('');
      setNewPassword('');
    } catch (err) {
      toast({ title: "Update Failed", description: err instanceof Error ? err.message : "Could not update the password.", variant: "destructive" });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50">
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 md:py-32">
        <div className="container text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-blue-400" />
          <h1 className="text-4xl font-bold mb-4">Admin Login</h1>
          <p className="text-slate-300">VedTech Services - Support Team Access</p>
        </div>
      </section>
      <section className="flex-1 flex items-center justify-center py-20 md:py-32">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Lock className="h-5 w-5" />
              Admin Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium mb-2 block">Admin Email</label>
              <Input
                type="email"
                placeholder="admin@vedtechservices.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Password</label>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <Button 
              className="w-full" 
              onClick={handleLogin}
              disabled={isLoading || !email || !password}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4 text-white" />
                  Logging in...
                </>
              ) : 'Login to Admin Dashboard'}
            </Button>

            <div className="text-center pt-2">
              <Button variant="link" className="text-sm text-blue-600 p-0 h-auto" onClick={() => setShowForgotDialog(true)}>
                Forgot Password?
              </Button>
            </div>

          </CardContent>
        </Card>
      </section>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotDialog} onOpenChange={setShowForgotDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-blue-500" />
              Reset Admin Password
            </DialogTitle>
            <DialogDescription>
              We'll send a 6-digit verification code to your official email to reset your account.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {step === 'request' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Official Admin Email</label>
                  <Input 
                    type="email" 
                    placeholder="admin@vedtechservices.in" 
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                  />
                </div>
                <Button className="w-full" onClick={handleRequestReset} disabled={isResetting || !resetEmail}>
                  {isResetting ? <LoadingSpinner className="mr-2 h-4 w-4" /> : 'Send Verification Code'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">6-Digit Verification Code</label>
                  <Input 
                    placeholder="Enter 6-digit code"
                    inputMode="numeric"
                    maxLength={6}
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Password</label>
                  <Input 
                    type="password"
                    placeholder="Use at least 12 characters"
                    minLength={12}
                    maxLength={128}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setStep('request')}>Back</Button>
                  <Button className="flex-[2]" onClick={handleResetPassword} disabled={isResetting || !resetCode || !newPassword}>
                    {isResetting ? <LoadingSpinner className="mr-2 h-4 w-4" /> : 'Update Password'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 2FA Verification Dialog */}
      <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              Two-Factor Authentication
            </DialogTitle>
            <DialogDescription>
              Your account has 2FA enabled. Please enter the 6-digit code from your authenticator app.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2 text-center">
              <Input 
                placeholder="000000" 
                className="text-center text-2xl tracking-[0.5em] h-14"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                maxLength={6}
              />
              <p className="text-[10px] text-slate-500 mt-2 italic">Enter the 6-digit code from your authenticator app</p>
            </div>
            <Button className="w-full" onClick={verify2FA} disabled={isLoading || totpCode.length < 6}>
              {isLoading ? <LoadingSpinner className="mr-2 h-4 w-4" /> : 'Verify and Login'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLogin;
