import { useEffect, useState } from 'react';
import seed from '@/data/portfolio-seed.json';
import { projectView, type Project } from '@/lib/portfolio';
export function useProjects(surface: string) {
  const [projects, setProjects] = useState<Project[]>(seed as Project[]);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    const load = () =>
      fetch('/api/portfolio', { cache: 'no-store' })
        .then(async (r) => {
          if (!r.ok) throw Error();
          return r.json();
        })
        .then((data) => {
          if (active) {
            setProjects(data);
            setError('');
          }
        })
        .catch(() => {
          if (active)
            setError('Live project updates are unavailable. Showing the last available website showcase.');
        });
    void load();
    window.addEventListener('focus', load);
    return () => {
      active = false;
      window.removeEventListener('focus', load);
    };
  }, []);
  return {
    rawProjects: projects,
    projects: projects.filter((p) => p.surfaces.includes(surface as any)).map((p) => projectView(p, surface)),
    error,
  };
}
