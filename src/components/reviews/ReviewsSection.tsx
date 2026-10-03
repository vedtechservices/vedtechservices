'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReviewCard from '@/components/reviews/ReviewCard';
import { GOOGLE_REVIEW_URL } from '@/data/reviews';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const AUTOPLAY_DELAY = 4500;

export default function ReviewsSection() {
  const [clientReviews, setClientReviews] = useState<any[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({ name: '', companyName: '', email: '', service: '', rating: 0, review: '' });
  const [position, setPosition] = useState(0);
  const [visibleSlides, setVisibleSlides] = useState(1);
  const [stepWidth, setStepWidth] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const viewportRef = useRef<HTMLDivElement>(null);
  const firstCardRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const reviewCount = clientReviews.length;
  const cloneCount = Math.min(visibleSlides, reviewCount);
  const slides = [
    ...clientReviews.slice(-cloneCount),
    ...clientReviews,
    ...clientReviews.slice(0, cloneCount),
  ];
  const renderedIndex = position < 0 ? reviewCount - 1 : position >= reviewCount ? 0 : position;

  const loadReviews = useCallback(async () => {
    try {
      const response = await fetch('/api/reviews', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      setClientReviews(data.map((item: any) => ({
        id: item.id, name: item.name, company: item.company_name || '', role: '', review: item.review,
        service: item.service || '', avatar: item.avatar || item.name.slice(0, 1).toUpperCase(), rating: item.rating,
        createdAt: item.created_at,
      })));
    } catch { /* keep the clean empty state when the service is unavailable */ }
  }, []);

  useEffect(() => { void loadReviews(); }, [loadReviews]);

  const submitReview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setFormError(''); setSending(true);
    try {
      const response = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not submit your review.');
      setSubmitted(true);
      setForm({ name: '', companyName: '', email: '', service: '', rating: 0, review: '' });
    } catch (error) { setFormError(error instanceof Error ? error.message : 'Could not submit your review.'); }
    finally { setSending(false); }
  };

  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => setReducedMotion(motionPreference.matches);
    updateMotionPreference();
    motionPreference.addEventListener('change', updateMotionPreference);
    return () => motionPreference.removeEventListener('change', updateMotionPreference);
  }, []);

  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth;
      setVisibleSlides(width >= 1280 ? 3 : width >= 768 ? 2 : 1);
      if (!firstCardRef.current) return;
      const cardWidth = firstCardRef.current.getBoundingClientRect().width;
      const track = firstCardRef.current.parentElement;
      const gap = track ? Number.parseFloat(window.getComputedStyle(track).columnGap) || 0 : 0;
      setStepWidth(cardWidth + gap);
    };

    updateLayout();
    const observer = new ResizeObserver(updateLayout);
    if (viewportRef.current) observer.observe(viewportRef.current);
    return () => observer.disconnect();
  }, [reviewCount, visibleSlides]);

  const move = useCallback((direction: -1 | 1) => {
    setPosition((current) => {
      if (direction > 0 && current >= reviewCount - 1) return reviewCount;
      if (direction < 0 && current <= 0) return -1;
      return current + direction;
    });
  }, [reviewCount]);

  useEffect(() => {
    if (paused || reducedMotion || reviewCount < 2) return;
    const timer = window.setTimeout(() => move(1), AUTOPLAY_DELAY);
    return () => window.clearTimeout(timer);
  }, [move, paused, position, reducedMotion, reviewCount]);

  const handleTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || (position !== reviewCount && position !== -1)) return;
    setTransitionEnabled(false);
    setPosition(position === reviewCount ? 0 : reviewCount - 1);
    window.requestAnimationFrame(() => setTransitionEnabled(true));
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    touchStartX.current = event.clientX;
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const delta = event.clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) > 45) move(delta < 0 ? 1 : -1);
  };

  const googleReviewButton = GOOGLE_REVIEW_URL ? (
    <Button asChild className="mt-4">
      <a href={GOOGLE_REVIEW_URL} target="_blank" rel="noopener noreferrer">
        Review us on Google
      </a>
    </Button>
  ) : (
    <Button className="mt-4" disabled aria-describedby="google-review-link-note">
      Review us on Google
    </Button>
  );

  return (
    <section
      aria-labelledby="client-reviews-heading"
      className="bg-slate-50 py-16 md:py-24"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      <div className="container">
        <header className="mb-10 text-center md:mb-12">
          <div className="mb-2 inline-flex items-center gap-2 font-semibold text-primary">
            <Star aria-hidden="true" className="h-5 w-5 fill-primary" />
            <span>Client reviews</span>
          </div>
          <h2 id="client-reviews-heading" className="mb-3 text-3xl font-bold md:text-5xl">
            What Our Clients Say
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Trusted by businesses for reliable technology and digital solutions.
          </p>
        </header>

        <div
          ref={viewportRef}
          role="group"
          aria-label="Client review carousel"
          aria-roledescription="carousel"
          className="overflow-hidden"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => { touchStartX.current = null; }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') move(-1);
            if (event.key === 'ArrowRight') move(1);
          }}
          tabIndex={reviewCount ? 0 : undefined}
          style={{ touchAction: 'pan-y' }}
        >
          {reviewCount === 0 ? (
            <div className="w-full rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-600">
              Be the first to share your experience with Ved Tech Services.
            </div>
          ) : (
          <div
            className="flex gap-5 md:gap-6"
            onTransitionEnd={handleTransitionEnd}
            style={{
              transform: `translate3d(-${(cloneCount + position) * stepWidth}px, 0, 0)`,
              transition: transitionEnabled && !reducedMotion ? 'transform 650ms ease-in-out' : 'none',
            }}
          >
            {slides.map((review, index) => (
              <div
                key={`${review.id}-${index}`}
                ref={index === 0 ? firstCardRef : undefined}
                aria-hidden={index < cloneCount || index >= cloneCount + reviewCount}
                role="group"
                aria-label={`Review ${((index - cloneCount + reviewCount) % reviewCount) + 1} of ${reviewCount}`}
                aria-roledescription="slide"
                className="min-w-0 flex-[0_0_100%] md:flex-[0_0_calc((100%-1.5rem)/2)] xl:flex-[0_0_calc((100%-3rem)/3)]"
              >
                <ReviewCard review={review} />
              </div>
            ))}
          </div>
          )}
        </div>

        {reviewCount > 0 && <div className="mt-6 flex items-center justify-center gap-3" role="group" aria-label="Carousel controls">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Previous reviews"
            onClick={() => move(-1)}
          >
            <ArrowLeft aria-hidden="true" />
          </Button>
          <div className="flex items-center gap-2" role="group" aria-label="Choose a review slide">
            {clientReviews.map((review, index) => (
              <button
                key={review.id}
                type="button"
                aria-label={`Go to review ${index + 1}`}
                aria-current={renderedIndex === index ? 'true' : undefined}
                onClick={() => setPosition(index)}
                className={`h-2.5 rounded-full transition-[width,background-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                  renderedIndex === index ? 'w-7 bg-primary' : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Next reviews"
            onClick={() => move(1)}
          >
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>}

        <p className="sr-only" aria-live={paused ? 'polite' : 'off'} aria-atomic="true">
          Review {renderedIndex + 1} of {reviewCount}
        </p>

        <div className="mt-12 text-center">
          <h3 className="text-xl font-semibold text-slate-900">Have you worked with us?</h3>
          <p className="mt-2 text-slate-600">Share your experience</p>
          <Button className="mt-4" onClick={() => { setFormOpen(true); setSubmitted(false); }}>Write a Review</Button>
          {googleReviewButton}
          {!GOOGLE_REVIEW_URL && (
            <p id="google-review-link-note" className="mt-2 text-sm text-slate-500">
              The verified Google review link will be added here when available.
            </p>
          )}
        </div>
      </div>
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader><DialogTitle>Write a Review</DialogTitle><DialogDescription>Your review will be visible after it has been approved.</DialogDescription></DialogHeader>
          {submitted ? <div className="rounded-lg bg-emerald-50 p-5 text-emerald-900">Thank you for your review! Your review has been submitted and is awaiting approval.</div> : (
            <form onSubmit={submitReview} className="space-y-4">
              <Input aria-label="Name" placeholder="Name *" required maxLength={100} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <Input aria-label="Company name" placeholder="Company name (optional)" maxLength={150} value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} />
              <Input aria-label="Email" type="email" placeholder="Email (optional, private)" maxLength={254} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <Input aria-label="Service" placeholder="Service (optional)" maxLength={120} value={form.service} onChange={e => setForm({ ...form, service: e.target.value })} />
              <fieldset><legend className="mb-2 text-sm font-medium">Rating *</legend><div className="flex gap-1" role="radiogroup" aria-label="Rating">
                {[1, 2, 3, 4, 5].map(value => <button key={value} type="button" role="radio" aria-checked={form.rating === value} aria-label={`${value} ${value === 1 ? 'star' : 'stars'}`} onClick={() => setForm({ ...form, rating: value })} className="rounded p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><Star className={`h-7 w-7 ${value <= form.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} /></button>)}
              </div></fieldset>
              <textarea aria-label="Review" required minLength={10} maxLength={2000} placeholder="Your review * (10–2000 characters)" value={form.review} onChange={e => setForm({ ...form, review: e.target.value })} className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              {formError && <p role="alert" className="text-sm text-red-600">{formError}</p>}
              <Button type="submit" disabled={sending || !form.rating}>{sending ? 'Submitting…' : 'Submit Review'}</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
