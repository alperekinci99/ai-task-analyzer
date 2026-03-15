export type AnalysisMode = 'standalone' | 'agent';

export type ProjectContext = {
  project_root: string;
  frameworks: string[];
  languages: string[];
  styling: string[];
  tooling: string[];
  instruction_files: string[];
  notes?: string[];
};

export type PromptAnalysis = {
  score: number;
  mode?: AnalysisMode;
  project_context?: ProjectContext;
  breakdown: {
    goal_clarity: number;
    context_completeness: number;
    output_specification: number;
    constraints: number;
    edge_cases: number;
    tool_instructions: number;
    definition_of_done: number;
    token_efficiency: number;
  };
  issues: string[];
  suggestions: string[];
  optimized_prompt: string;
  warnings?: string[];
  detected_strengths?: string[];
};
