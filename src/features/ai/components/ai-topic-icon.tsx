import { Blocks, BrainCircuit, MessagesSquare, Network, Workflow } from 'lucide-react';
import type { AiTopicIcon as AiTopicIconName } from '../types';

interface AiTopicIconProps {
  name: AiTopicIconName;
  className?: string;
}

export function AiTopicIcon({ name, className = 'h-5 w-5' }: AiTopicIconProps) {
  switch (name) {
    case 'brain':
      return <BrainCircuit className={className} />;
    case 'interface':
      return <MessagesSquare className={className} />;
    case 'harness':
      return <Workflow className={className} />;
    case 'skills':
      return <Blocks className={className} />;
    case 'multi-agent':
      return <Network className={className} />;
  }
}
