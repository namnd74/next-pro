export interface RoadmapStageSpec {
  id: string;
  stepNumber: number;
  title: string;
  shortGoal: string;
  iconName?: string;
  targetLevel: 'junior' | 'middle' | 'senior';
  visualAnchorQuestionId?: string;
  questionIds: string[];
}

export interface TopicRoadmapSpec {
  topicId: string;
  title: string;
  tagline: string;
  mindmapCode: string;
  stages: RoadmapStageSpec[];
}
