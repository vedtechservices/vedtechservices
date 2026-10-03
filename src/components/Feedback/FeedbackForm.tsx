import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { supabase } from '@/db/supabase';
import { toast } from 'sonner';

interface FeedbackFormProps {
  ticketId: string;
  customerId?: string;
  employeeId?: string;
  onSuccess?: () => void;
}

export default function FeedbackForm({ ticketId, customerId, employeeId, onSuccess }: FeedbackFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await (supabase
        .from('customer_feedback') as any)
        .insert({
          ticket_id: ticketId,
          customer_id: customerId || null,
          employee_id: employeeId || null,
          rating,
          review_text: reviewText || null,
        });

      if (error) throw error;

      toast.success('Thank you for your feedback!');
      setSubmitted(true);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800 text-balance">Thank You!</CardTitle>
          <CardDescription className="text-green-700">
            Your feedback has been submitted successfully. We appreciate your input!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-balance">Rate Your Experience</CardTitle>
        <CardDescription className="text-pretty">
          How satisfied are you with the service you received?
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label>Rating *</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-muted-foreground">
                {rating === 1 && 'Very Dissatisfied'}
                {rating === 2 && 'Dissatisfied'}
                {rating === 3 && 'Neutral'}
                {rating === 4 && 'Satisfied'}
                {rating === 5 && 'Very Satisfied'}
              </p>
            )}
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <Label htmlFor="review">Additional Comments (Optional)</Label>
            <Textarea
              id="review"
              placeholder="Tell us more about your experience..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={submitting || rating === 0} className="w-full">
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
