'use client';

import { lazy, Suspense, useState } from 'react';
import { Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ChatBot = lazy(() => import('./ChatBot'));

export default function SupportChatLauncher() {
  const [activated, setActivated] = useState(false);
  const launcher = (
    <Button
      onClick={() => setActivated(true)}
      className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-xl z-50"
      aria-label="Open support chat"
      aria-busy={activated}
    >
      <Bot />
    </Button>
  );

  return activated ? (
    <Suspense fallback={launcher}><ChatBot initiallyOpen /></Suspense>
  ) : launcher;
}
