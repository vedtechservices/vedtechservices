import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Filter } from 'lucide-react';

export interface Condition {
  id: string;
  field: string;
  operator: string;
  value: string;
  logicalOperator?: 'AND' | 'OR';
}

interface ConditionsBuilderProps {
  conditions: Condition[];
  onChange: (conditions: Condition[]) => void;
  dataSource?: string;
}

const FIELDS = [
  { value: 'customer_name', label: 'Customer Name' },
  { value: 'customer_email', label: 'Customer Email' },
  { value: 'customer_type', label: 'Customer Type' },
  { value: 'amc_status', label: 'AMC Status' },
  { value: 'total_tickets', label: 'Total Tickets' },
  { value: 'customer_lifetime_value', label: 'Customer Lifetime Value' },
  { value: 'registration_date', label: 'Registration Date' },
  { value: 'last_service_date', label: 'Last Service Date' },
  { value: 'ticket_priority', label: 'Ticket Priority' },
  { value: 'ticket_status', label: 'Ticket Status' },
  { value: 'ticket_category', label: 'Ticket Category' },
  { value: 'assigned_engineer', label: 'Assigned Engineer' },
  { value: 'lead_status', label: 'Lead Status' },
  { value: 'lead_source', label: 'Lead Source' },
  { value: 'deal_value', label: 'Deal Value' },
  { value: 'campaign_name', label: 'Campaign Name' },
  { value: 'open_rate', label: 'Open Rate' },
  { value: 'click_rate', label: 'Click Rate' }
];

const OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Does Not Contain' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'between', label: 'Between' },
  { value: 'is_empty', label: 'Is Empty' },
  { value: 'is_not_empty', label: 'Is Not Empty' }
];

export default function ConditionsBuilder({ conditions, onChange, dataSource }: ConditionsBuilderProps) {
  const [previewCount, setPreviewCount] = useState<number | null>(null);

  const addCondition = () => {
    const newCondition: Condition = {
      id: `condition-${Date.now()}`,
      field: '',
      operator: 'equals',
      value: '',
      logicalOperator: conditions.length > 0 ? 'AND' : undefined
    };
    onChange([...conditions, newCondition]);
  };

  const updateCondition = (id: string, updates: Partial<Condition>) => {
    onChange(
      conditions.map((condition) =>
        condition.id === id ? { ...condition, ...updates } : condition
      )
    );
  };

  const removeCondition = (id: string) => {
    const updatedConditions = conditions.filter((c) => c.id !== id);
    // Update logical operators
    if (updatedConditions.length > 0 && updatedConditions[0].logicalOperator) {
      updatedConditions[0] = { ...updatedConditions[0], logicalOperator: undefined };
    }
    onChange(updatedConditions);
  };

  const getFieldLabel = (fieldValue: string): string => {
    return FIELDS.find(f => f.value === fieldValue)?.label || fieldValue;
  };

  const getOperatorLabel = (operatorValue: string): string => {
    return OPERATORS.find(o => o.value === operatorValue)?.label || operatorValue;
  };

  // Simulate preview count (in real implementation, this would query the database)
  const calculatePreviewCount = () => {
    const validConditions = conditions.filter(c => c.field && c.operator);
    if (validConditions.length === 0) {
      setPreviewCount(null);
      return;
    }
    // Simulated count
    setPreviewCount(Math.floor(Math.random() * 500) + 50);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filter Conditions</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCondition}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Condition
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {conditions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Filter className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No conditions added yet</p>
            <p className="text-xs mt-1">Click "Add Condition" to start filtering</p>
          </div>
        ) : (
          <div className="space-y-3">
            {conditions.map((condition, index) => (
              <div key={condition.id} className="space-y-2">
                {/* Logical Operator */}
                {index > 0 && condition.logicalOperator && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 border-t" />
                    <Select
                      value={condition.logicalOperator}
                      onValueChange={(value) =>
                        updateCondition(condition.id, { logicalOperator: value as 'AND' | 'OR' })
                      }
                    >
                      <SelectTrigger className="w-24 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AND">AND</SelectItem>
                        <SelectItem value="OR">OR</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex-1 border-t" />
                  </div>
                )}

                {/* Condition Row */}
                <div className="flex flex-col md:flex-row gap-2 p-3 border rounded-md bg-muted/30">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                    {/* Field */}
                    <Select
                      value={condition.field}
                      onValueChange={(value) => updateCondition(condition.id, { field: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        {FIELDS.map((field) => (
                          <SelectItem key={field.value} value={field.value}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Operator */}
                    <Select
                      value={condition.operator}
                      onValueChange={(value) => updateCondition(condition.id, { operator: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select operator" />
                      </SelectTrigger>
                      <SelectContent>
                        {OPERATORS.map((operator) => (
                          <SelectItem key={operator.value} value={operator.value}>
                            {operator.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Value */}
                    {condition.operator !== 'is_empty' && condition.operator !== 'is_not_empty' && (
                      <Input
                        placeholder="Enter value"
                        value={condition.value}
                        onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                      />
                    )}
                  </div>

                  {/* Remove Button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => removeCondition(condition.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Preview */}
        {conditions.length > 0 && (
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={calculatePreviewCount}
            >
              Preview Results
            </Button>
            {previewCount !== null && (
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-md">
                <p className="text-sm font-medium">
                  Approximately {previewCount} records match these conditions
                </p>
              </div>
            )}
          </div>
        )}

        {/* Summary */}
        {conditions.length > 0 && (
          <div className="p-3 bg-muted rounded-md space-y-2">
            <p className="text-sm font-medium">Conditions Summary:</p>
            <div className="flex flex-wrap gap-2">
              {conditions.map((condition, index) => (
                <div key={condition.id} className="flex items-center gap-1">
                  {index > 0 && condition.logicalOperator && (
                    <Badge variant="outline" className="text-xs">
                      {condition.logicalOperator}
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xs">
                    {condition.field ? getFieldLabel(condition.field) : 'Field'}{' '}
                    {getOperatorLabel(condition.operator)}{' '}
                    {condition.value && `"${condition.value}"`}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
