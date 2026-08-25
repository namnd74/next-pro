import { AgentSkillsStudio } from './labs/agent-skills-studio';
import type { AiInteractiveLab as AiInteractiveLabName } from '../types';

export function AiLabRenderer({ lab }: { lab: AiInteractiveLabName }) {
  switch (lab) {
    case 'agent-skills-studio':
      return <AgentSkillsStudio />;
  }
}
