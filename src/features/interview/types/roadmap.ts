export interface RoadmapStageSpec {
  id: string;
  stepNumber: number;
  title: string;
  shortGoal: string;
  iconName?: string;
  knowledgeDomain?: string;
  visualAnchorQuestionId?: string;
  questionIds: string[];
  prerequisiteStageIds?: string[];
  layoutPosition?: { x: number; y: number };
}

export interface RoadmapEdgeSpec {
  from: string;
  to: string;
  label?: string;
}

export interface TopicRoadmapSpec {
  topicId: string;
  title: string;
  tagline: string;
  mindmapCode: string;
  stages: RoadmapStageSpec[];
  edges?: RoadmapEdgeSpec[];
}

