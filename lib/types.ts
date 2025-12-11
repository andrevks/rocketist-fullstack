export type TaskStatus = 'pending' | 'done';

export interface TaskStep {
  order: number;
  text: string;
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  description?: string | null;
  steps?: TaskStep[] | null;
  extra_info?: any;
  needs_enrichment: boolean;
  ai_last_run_at?: string | null;
  created_at: string;
  updated_at: string;
  source?: string | null;
}

export interface CreateTaskDto {
  title: string;
  source?: string;
}

export interface UpdateTaskDto {
  title?: string;
  status?: TaskStatus;
  description?: string;
  steps?: TaskStep[];
  extra_info?: any;
  needs_enrichment?: boolean;
}

export interface UpdateTaskEnrichmentDto {
  description?: string;
  steps?: TaskStep[];
  extra_info?: any;
  ai_last_run_at?: string;
}

