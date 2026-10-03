import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from '@/lib/next-router';

type Review = { id: string; name: string; company_name: string | null; email: string | null; service: string | null; rating: number; review: string; status: string; created_at: string; avatar: string | null };
const statuses = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [editing, setEditing] = useState<Review | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const load = useCallback(async () => {
    const response = await fetch(`/api/admin/reviews${filter === 'ALL' ? '' : `?status=${filter}`}`, { cache: 'no-store' });
    if (response.status === 401) { navigate('/admin/login'); return; }
    const data = await response.json();
    if (!response.ok) { setError(data.error || 'Could not load reviews.'); return; }
    setReviews(data);
  }, [filter, navigate]);
  useEffect(() => { void load(); }, [load]);

  const mutate = async (method: 'PATCH' | 'DELETE', body: unknown, confirmDelete = false) => {
    if (confirmDelete && !window.confirm('Are you sure you want to delete this review?')) return;
    const response = await fetch('/api/admin/reviews', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const result = await response.json();
    if (!response.ok) { setError(result.error || 'Action failed.'); return; }
    setEditing(null); await load();
  };

  const visible = reviews.filter(item => `${item.name} ${item.company_name ?? ''} ${item.review}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => sort === 'oldest' ? a.created_at.localeCompare(b.created_at) : sort === 'rating' ? b.rating - a.rating : b.created_at.localeCompare(a.created_at));
  return <main className="container space-y-6 py-10">
    <div><p className="text-sm font-medium text-primary">Admin</p><h1 className="text-3xl font-bold">Client Reviews</h1></div>
    <Card><CardHeader><CardTitle>Review submissions</CardTitle></CardHeader><CardContent className="space-y-4">
      <div className="flex flex-wrap gap-2">{statuses.map(status => <Button key={status} variant={filter === status ? 'default' : 'outline'} onClick={() => setFilter(status)}>{status[0] + status.slice(1).toLowerCase()}</Button>)}</div>
      <div className="flex flex-wrap gap-3"><Input aria-label="Search reviews" placeholder="Search name, company, review" value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" /><select aria-label="Sort reviews" value={sort} onChange={e => setSort(e.target.value)} className="rounded-md border bg-background px-3"><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="rating">Rating</option></select></div>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {!visible.length ? <p className="py-8 text-center text-muted-foreground">No reviews found.</p> : <div className="space-y-3">{visible.map(item => <article key={item.id} className="rounded-lg border p-4">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold">{item.name}{item.company_name ? ` · ${item.company_name}` : ''}</h2><p className="text-sm text-muted-foreground">{'★'.repeat(item.rating)}{'☆'.repeat(5-item.rating)} · {item.service || 'No service'} · {new Date(item.created_at).toLocaleString()}</p><span className="text-xs font-semibold">{item.status}</span></div><div className="flex flex-wrap gap-2">
          {item.status !== 'APPROVED' && <Button size="sm" onClick={() => void mutate('PATCH', { id: item.id, status: 'APPROVED' })}>Approve</Button>}{item.status !== 'REJECTED' && <Button size="sm" variant="outline" onClick={() => void mutate('PATCH', { id: item.id, status: 'REJECTED' })}>Reject</Button>}<Button size="sm" variant="outline" onClick={() => setEditing(item)}>View / Edit</Button><Button size="sm" variant="destructive" onClick={() => void mutate('DELETE', { id: item.id }, true)}>Delete</Button>
        </div></div><p className="mt-3 whitespace-pre-wrap">{item.review}</p>{item.email && <p className="mt-2 text-xs text-muted-foreground">Private contact: {item.email}</p>}
      </article>)}</div>}
    </CardContent></Card>
    {editing && <div role="dialog" aria-modal="true" aria-label="Edit review" className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"><form className="w-full max-w-xl space-y-3 rounded-xl bg-background p-6" onSubmit={event => { event.preventDefault(); const fd = new FormData(event.currentTarget); void mutate('PATCH', { id: editing.id, name: fd.get('name'), company_name: fd.get('company'), service: fd.get('service'), rating: Number(fd.get('rating')), review: fd.get('review') }); }}><h2 className="text-xl font-bold">Edit review</h2><Input name="name" aria-label="Name" defaultValue={editing.name} required maxLength={100} /><Input name="company" aria-label="Company" defaultValue={editing.company_name ?? ''} maxLength={150} /><Input name="service" aria-label="Service" defaultValue={editing.service ?? ''} maxLength={120} /><select name="rating" aria-label="Rating" defaultValue={editing.rating} className="w-full rounded-md border bg-background p-2">{[1,2,3,4,5].map(n => <option key={n} value={n}>{n} stars</option>)}</select><textarea name="review" aria-label="Review" defaultValue={editing.review} required minLength={10} maxLength={2000} className="min-h-32 w-full rounded-md border bg-background p-3" /><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button type="submit">Save changes</Button></div></form></div>}
  </main>;
}
