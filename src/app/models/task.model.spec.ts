import { Task, TaskFilter } from './task.model';

describe('Task Model', () => {
  describe('Task Interface', () => {
    it('should define Task interface structure', () => {
      const task: Task = {
        id: 1,
        title: 'Test Task',
        description: 'Test Description',
        dueDate: '2025-12-31',
        priority: 'High',
        status: 'Not Started',
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01'
      };

      expect(task.id).toBeDefined();
      expect(task.title).toBeDefined();
      expect(task.description).toBeDefined();
      expect(task.dueDate).toBeDefined();
      expect(task.priority).toBeDefined();
      expect(task.status).toBeDefined();
      expect(task.createdAt).toBeDefined();
      expect(task.updatedAt).toBeDefined();
    });

    it('should accept valid priority values', () => {
      const taskLow: Task = {
        id: 1,
        title: 'Task',
        description: 'Description',
        dueDate: '2025-12-31',
        priority: 'Low',
        status: 'Not Started',
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01'
      };

      const taskNormal: Task = {
        ...taskLow,
        priority: 'Normal'
      };

      const taskHigh: Task = {
        ...taskLow,
        priority: 'High'
      };

      expect(taskLow.priority).toBe('Low');
      expect(taskNormal.priority).toBe('Normal');
      expect(taskHigh.priority).toBe('High');
    });

    it('should accept valid status values', () => {
      const taskNotStarted: Task = {
        id: 1,
        title: 'Task',
        description: 'Description',
        dueDate: '2025-12-31',
        priority: 'High',
        status: 'Not Started',
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01'
      };

      const taskInProgress: Task = {
        ...taskNotStarted,
        status: 'In Progress'
      };

      const taskCompleted: Task = {
        ...taskNotStarted,
        status: 'Completed'
      };

      expect(taskNotStarted.status).toBe('Not Started');
      expect(taskInProgress.status).toBe('In Progress');
      expect(taskCompleted.status).toBe('Completed');
    });
  });

  describe('TaskFilter Interface', () => {
    it('should define TaskFilter interface structure', () => {
      const filter: TaskFilter = {
        status: 'All'
      };

      expect(filter.status).toBeDefined();
      expect(filter.status).toBe('All');
    });

    it('should accept valid filter status values', () => {
      const filterAll: TaskFilter = { status: 'All' };
      const filterNotStarted: TaskFilter = { status: 'Not Started' };
      const filterInProgress: TaskFilter = { status: 'In Progress' };
      const filterCompleted: TaskFilter = { status: 'Completed' };

      expect(filterAll.status).toBe('All');
      expect(filterNotStarted.status).toBe('Not Started');
      expect(filterInProgress.status).toBe('In Progress');
      expect(filterCompleted.status).toBe('Completed');
    });
  });
});
