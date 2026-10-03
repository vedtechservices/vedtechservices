import { Quote, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { ClientReview } from '@/data/reviews';

interface ReviewCardProps {
  review: ClientReview;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Card className="h-full border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="flex h-full flex-col p-6 md:p-7">
        <div className="mb-3 flex gap-0.5" aria-label={`${review.rating || 5} out of 5 stars`}>
          {Array.from({ length: 5 }, (_, index) => <Star key={index} aria-hidden="true" className={`h-4 w-4 ${index < (review.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />)}
        </div>
        <Quote aria-hidden="true" className="mb-4 h-7 w-7 text-primary/50" />
        <p className="line-clamp-6 flex-1 text-base leading-relaxed text-slate-700">“{review.review}”</p>
        <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
          <div
            aria-hidden="true"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
          >
            {review.avatar}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">{review.name}</p>
            {review.company && <p className="truncate text-sm text-slate-600">{review.company}</p>}
            {review.service && <p className="mt-1 text-xs font-medium text-primary">{review.service}</p>}
            {review.createdAt && <p className="mt-1 text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
