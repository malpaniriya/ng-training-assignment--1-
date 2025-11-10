export interface Task {
    id: number;
  title: string;
  description: string;
  dueDate: string;
  priority: 'Low' | 'Normal' | 'High';
  status: 'Not Started' | 'In Progress' | 'Completed';
  createdAt: string;
  updatedAt: string;
}

export interface TaskFilter {
  status: 'All' | 'Not Started' | 'In Progress' | 'Completed';
}
