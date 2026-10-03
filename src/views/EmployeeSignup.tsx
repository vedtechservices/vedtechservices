import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, Mail, Lock, User, Briefcase, Phone } from 'lucide-react';
import { useNavigate, Link } from '@/lib/next-router';
import { LoadingSpinner } from '@/components/common/Loader';
import { useToast } from '@/hooks/use-toast';

const EmployeeSignup: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignup = async () => {
    setError('');
    
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 12) {
      setError('Choose a password with at least 12 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/employee/signup', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, department: form.department, password: form.password }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Registration failed.');
      toast({
        title: "Registration Successful",
        description: `Your temporary Employee ID is ${result.employeeId}. Please wait for admin approval to login.`,
      });
      navigate('/employee/login');
    } catch (err) {
      console.error('Signup error:', err);
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50">
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 md:py-24">
        <div className="container text-center">
          <UserPlus className="h-16 w-16 mx-auto mb-4 text-blue-400" />
          <h1 className="text-4xl font-bold mb-4">Join the Team</h1>
          <p className="text-slate-300">Register as a VedTech Engineering Professional</p>
        </div>
      </section>

      <section className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-center">Create Professional Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="John Doe" 
                    className="pl-10" 
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Official Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    type="email" 
                    placeholder="john@vedtech.com" 
                    className="pl-10"
                    value={form.email}
                    onChange={(e) => setForm({...form, email: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="+91 9876543210" 
                    className="pl-10"
                    value={form.phone}
                    onChange={(e) => setForm({...form, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Field Engineering" 
                    className="pl-10"
                    value={form.department}
                    onChange={(e) => setForm({...form, department: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10"
                    value={form.password}
                    onChange={(e) => setForm({...form, password: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({...form, confirmPassword: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <Button 
              className="w-full" 
              onClick={handleSignup}
              disabled={isLoading || !form.email || !form.password}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4 text-white" />
                  Processing...
                </>
              ) : 'Register as Employee'}
            </Button>

            <div className="text-center text-sm text-slate-500 pt-4 border-t">
              Already have an account? <Link to="/employee/login" className="text-blue-600 font-medium">Login here</Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default EmployeeSignup;
