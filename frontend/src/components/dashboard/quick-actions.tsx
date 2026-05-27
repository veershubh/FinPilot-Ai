// src/components/dashboard/quick-actions.tsx
// Action buttons for common dashboard tasks.

import { Upload, CreditCard, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function QuickActions() {
  const router = useRouter();

  const handleUpload = () => {
    toast.info('Upload CSV clicked – feature coming soon');
  };

  const handleAnalyze = () => {
    toast.success('Analyzing purchase…');
    // Simulate navigation to analyzer page
    router.push('/emi-analyzer');
  };

  const handleAI = () => {
    toast.success('Opening AI assistant…');
    router.push('/ai-chat');
  };

  const actions = [
    { label: 'Upload CSV', icon: Upload, onClick: handleUpload },
    { label: 'Analyze Purchase', icon: CreditCard, onClick: handleAnalyze },
    { label: 'Ask AI', icon: Bot, onClick: handleAI },
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {actions.map(action => (
        <button
          key={action.label}
          onClick={action.onClick}
          className={cn(
            'glass-card flex flex-col items-center justify-center p-4 rounded-xl border border-[#1F2937] hover:glow-green transition-shadow',
            'text-[#94A3B8] hover:text-white'
          )}
        >
          <action.icon className="w-6 h-6 mb-2 text-[#10B981]" />
          <span className="text-sm font-medium">{action.label}</span>
        </button>
      ))}
    </section>
  );
}
