import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Recipient {
  id: string;
  email?: string;
  role?: string;
  type: 'individual' | 'role';
}

interface RecipientManagerProps {
  recipients: Recipient[];
  onChange: (recipients: Recipient[]) => void;
}

const ADMIN_ROLES = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'full_access_admin', label: 'Full Access Admin' },
  { value: 'support_only_admin', label: 'Support Only Admin' },
  { value: 'billing_only_admin', label: 'Billing Only Admin' }
];

export default function RecipientManager({ recipients, onChange }: RecipientManagerProps) {
  const [emailInput, setEmailInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const addIndividualRecipient = () => {
    if (!emailInput.trim()) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(emailInput)) {
      setEmailError('Invalid email format');
      return;
    }

    // Check for duplicates
    if (recipients.some(r => r.email === emailInput)) {
      setEmailError('Email already added');
      return;
    }

    const newRecipient: Recipient = {
      id: `email-${Date.now()}`,
      email: emailInput,
      type: 'individual'
    };

    onChange([...recipients, newRecipient]);
    setEmailInput('');
    setEmailError('');
  };

  const addRoleRecipient = () => {
    if (!selectedRole) {
      return;
    }

    // Check for duplicates
    if (recipients.some(r => r.role === selectedRole)) {
      return;
    }

    const newRecipient: Recipient = {
      id: `role-${Date.now()}`,
      role: selectedRole,
      type: 'role'
    };

    onChange([...recipients, newRecipient]);
    setSelectedRole('');
  };

  const removeRecipient = (id: string) => {
    onChange(recipients.filter(r => r.id !== id));
  };

  const getRoleLabel = (roleValue: string): string => {
    return ADMIN_ROLES.find(r => r.value === roleValue)?.label || roleValue;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recipients</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Individual Email */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Add Individual Email</label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="email"
                placeholder="Enter email address"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  setEmailError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addIndividualRecipient();
                  }
                }}
                className={emailError ? 'border-red-500' : ''}
              />
              {emailError && (
                <p className="text-sm text-red-500 mt-1">{emailError}</p>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={addIndividualRecipient}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Add Role */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Add Admin Role</label>
          <div className="flex gap-2">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select admin role" />
              </SelectTrigger>
              <SelectContent>
                {ADMIN_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={addRoleRecipient}
              disabled={!selectedRole}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Recipients List */}
        {recipients.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Selected Recipients ({recipients.length})
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {recipients.map((recipient) => (
                <div
                  key={recipient.id}
                  className="flex items-center justify-between p-2 border rounded-md bg-muted/50"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {recipient.type === 'individual' ? (
                      <>
                        <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm truncate">{recipient.email}</span>
                        <Badge variant="outline" className="shrink-0">Individual</Badge>
                      </>
                    ) : (
                      <>
                        <Badge variant="secondary" className="shrink-0">
                          {getRoleLabel(recipient.role || '')}
                        </Badge>
                        <span className="text-sm text-muted-foreground">All users with this role</span>
                      </>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => removeRecipient(recipient.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {recipients.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No recipients added yet</p>
            <p className="text-xs mt-1">Add individual emails or select admin roles above</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
