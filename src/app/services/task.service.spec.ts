import { TestBed } from '@angular/core/testing';
import { TaskService } from './task.service';
import { Task } from '../models/task.model';

describe('TaskService', () => {
  let service: TaskService;
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    localStorageMock = {};
    const localStorage = {
      getItem: (key: string): string | null => {
        return localStorageMock[key] || null;
      },
      setItem: (key: string, value: string): void => {
        localStorageMock[key] = value;
      },
      removeItem: (key: string): void => {
        delete localStorageMock[key];
      },
      clear: (): void => {
        localStorageMock = {};
      }
    };

    Object.defineProperty(window, 'localStorage', {
      value: localStorage,
      writable: true
    });

    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskService);
    localStorageMock = {};
  });

  afterEach(() => {
    localStorageMock = {};
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeDefined();
    });

    it('should load tasks from localStorage on initialization', () => {
      const mockTasks: Task[] = [
        {
          id: 1,
          title: 'Test Task',
          description: 'Test Description',
          dueDate: '2025-12-31',
          priority: 'High',
          status: 'Not Started',
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01'
        }
      ];
      localStorageMock['tasks'] = JSON.stringify(mockTasks);
      
      const newService = new TaskService();
      const tasks = newService.getTasksByStatus('All');
      
      expect(tasks.length).toBe(1);
      expect(tasks[0].title).toBe('Test Task');
    });

    it('should handle empty localStorage gracefully', () => {
      localStorageMock = {};
      const newService = new TaskService();
      const tasks = newService.getTasksByStatus('All');
      
      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks.length).toBe(0);
    });
  });

  describe('getTasksByStatus', () => {
    beforeEach(() => {
      const mockTasks: Task[] = [
        {
          id: 1,
          title: 'Not Started Task',
          description: 'Description 1',
          dueDate: '2025-12-31',
          priority: 'High',
          status: 'Not Started',
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01'
        },
        {
          id: 2,
          title: 'In Progress Task',
          description: 'Description 2',
          dueDate: '2025-12-31',
          priority: 'Normal',
          status: 'In Progress',
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01'
        },
        {
          id: 3,
          title: 'Completed Task',
          description: 'Description 3',
          dueDate: '2025-12-31',
          priority: 'Low',
          status: 'Completed',
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01'
        }
      ];
      localStorageMock['tasks'] = JSON.stringify(mockTasks);
      service = new TaskService();
    });

    it('should return all tasks when status is "All"', () => {
      const tasks = service.getTasksByStatus('All');
      expect(tasks.length).toBe(3);
    });

    it('should return only tasks with "Not Started" status', () => {
      const tasks = service.getTasksByStatus('Not Started');
      expect(tasks.length).toBe(1);
      expect(tasks[0].status).toBe('Not Started');
      expect(tasks[0].title).toBe('Not Started Task');
    });

    it('should return only tasks with "In Progress" status', () => {
      const tasks = service.getTasksByStatus('In Progress');
      expect(tasks.length).toBe(1);
      expect(tasks[0].status).toBe('In Progress');
      expect(tasks[0].title).toBe('In Progress Task');
    });

    it('should return only tasks with "Completed" status', () => {
      const tasks = service.getTasksByStatus('Completed');
      expect(tasks.length).toBe(1);
      expect(tasks[0].status).toBe('Completed');
      expect(tasks[0].title).toBe('Completed Task');
    });

    it('should return empty array when no tasks match status', () => {
      localStorageMock = {};
      service = new TaskService();
      const tasks = service.getTasksByStatus('Not Started');
      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks.length).toBe(0);
    });
  });

  describe('addTask', () => {
    it('should add a new task with generated id and timestamps', () => {
      const newTask = {
        title: 'New Task',
        description: 'New Description',
        dueDate: '2025-12-31',
        priority: 'High' as const,
        status: 'Not Started' as const
      };

      service.addTask(newTask);
      const tasks = service.getTasksByStatus('All');

      expect(tasks.length).toBe(1);
      expect(tasks[0].title).toBe('New Task');
      expect(typeof tasks[0].id).toBe('number');
      expect(typeof tasks[0].createdAt).toBe('string');
      expect(typeof tasks[0].updatedAt).toBe('string');
    });

    it('should save task to localStorage', () => {
      const newTask = {
        title: 'New Task',
        description: 'New Description',
        dueDate: '2025-12-31',
        priority: 'Normal' as const,
        status: 'In Progress' as const
      };

      service.addTask(newTask);
      const savedData = localStorageMock['tasks'];
      const parsedTasks = JSON.parse(savedData);

      expect(parsedTasks.length).toBe(1);
      expect(parsedTasks[0].title).toBe('New Task');
    });

    it('should add multiple tasks correctly', () => {
      const task1 = {
        title: 'Task 1',
        description: 'Description 1',
        dueDate: '2025-12-31',
        priority: 'High' as const,
        status: 'Not Started' as const
      };

      const task2 = {
        title: 'Task 2',
        description: 'Description 2',
        dueDate: '2025-12-31',
        priority: 'Low' as const,
        status: 'Completed' as const
      };

      service.addTask(task1);
      service.addTask(task2);
      const tasks = service.getTasksByStatus('All');

      expect(tasks.length).toBe(2);
      expect(tasks[0].title).toBe('Task 1');
      expect(tasks[1].title).toBe('Task 2');
    });
  });

  describe('deleteTask', () => {
    beforeEach(() => {
      const mockTasks: Task[] = [
        {
          id: 1,
          title: 'Task 1',
          description: 'Description 1',
          dueDate: '2025-12-31',
          priority: 'High',
          status: 'Not Started',
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01'
        },
        {
          id: 2,
          title: 'Task 2',
          description: 'Description 2',
          dueDate: '2025-12-31',
          priority: 'Normal',
          status: 'In Progress',
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01'
        }
      ];
      localStorageMock['tasks'] = JSON.stringify(mockTasks);
      service = new TaskService();
    });

    it('should delete task with given id', () => {
      service.deleteTask(1);
      const tasks = service.getTasksByStatus('All');

      expect(tasks.length).toBe(1);
      expect(tasks[0].id).toBe(2);
    });

    it('should update localStorage after deletion', () => {
      service.deleteTask(1);
      const savedData = localStorageMock['tasks'];
      const parsedTasks = JSON.parse(savedData);

      expect(parsedTasks.length).toBe(1);
      expect(parsedTasks[0].id).toBe(2);
    });

    it('should handle deletion of non-existent task gracefully', () => {
      const initialTasks = service.getTasksByStatus('All');
      service.deleteTask(999);
      const tasksAfterDelete = service.getTasksByStatus('All');

      expect(tasksAfterDelete.length).toBe(initialTasks.length);
    });

    it('should delete all tasks when deleting multiple', () => {
      service.deleteTask(1);
      service.deleteTask(2);
      const tasks = service.getTasksByStatus('All');

      expect(tasks.length).toBe(0);
    });
  });

  describe('updateTask', () => {
    let existingTask: Task;

    beforeEach(() => {
      existingTask = {
        id: 1,
        title: 'Original Task',
        description: 'Original Description',
        dueDate: '2025-12-31',
        priority: 'High',
        status: 'Not Started',
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01'
      };
      localStorageMock['tasks'] = JSON.stringify([existingTask]);
      service = new TaskService();
    });

    it('should update existing task', () => {
      const updates = {
        title: 'Updated Task',
        status: 'In Progress' as const
      };

      service.updateTask(1, updates);
      const tasks = service.getTasksByStatus('All');

      expect(tasks[0].title).toBe('Updated Task');
      expect(tasks[0].status).toBe('In Progress');
      expect(tasks[0].description).toBe('Original Description');
    });

    it('should update updatedAt timestamp', () => {
      const originalUpdatedAt = existingTask.updatedAt;
      const updates = { title: 'Updated Task' };

      service.updateTask(1, updates);
      const tasks = service.getTasksByStatus('All');

      const savedData = localStorageMock['tasks'];
      const parsedTasks = JSON.parse(savedData);
      expect(parsedTasks[0].updatedAt).not.toBe(originalUpdatedAt);
      expect(typeof parsedTasks[0].updatedAt).toBe('string');
    });

    it('should update localStorage after task update', () => {
      const updates = { title: 'Updated Task' };
      service.updateTask(1, updates);
      
      const savedData = localStorageMock['tasks'];
      const parsedTasks = JSON.parse(savedData);

      expect(parsedTasks[0].title).toBe('Updated Task');
    });

    it('should not update non-existent task', () => {
      const initialTasks = service.getTasksByStatus('All');
      service.updateTask(999, { title: 'Should Not Update' });
      const tasksAfterUpdate = service.getTasksByStatus('All');

      expect(tasksAfterUpdate.length).toBe(initialTasks.length);
      expect(tasksAfterUpdate[0].title).toBe('Original Task');
    });

    it('should update multiple fields at once', () => {
      const updates = {
        title: 'Updated Task',
        description: 'Updated Description',
        priority: 'Low' as const,
        status: 'Completed' as const
      };

      service.updateTask(1, updates);
      const tasks = service.getTasksByStatus('All');

      expect(tasks[0].title).toBe('Updated Task');
      expect(tasks[0].description).toBe('Updated Description');
      expect(tasks[0].priority).toBe('Low');
      expect(tasks[0].status).toBe('Completed');
    });
  });

  describe('getTaskStatistics', () => {
    it('should return correct statistics for empty task list', () => {
      const stats = service.getTaskStatistics();

      expect(stats.total).toBe(0);
      expect(stats.completed).toBe(0);
      expect(stats.notStarted).toBe(0);
      expect(stats.inProgress).toBe(0);
    });

    it('should return correct statistics for tasks with different statuses', () => {
      const mockTasks: Task[] = [
        {
          id: 1,
          title: 'Not Started Task',
          description: 'Description 1',
          dueDate: '2025-12-31',
          priority: 'High',
          status: 'Not Started',
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01'
        },
        {
          id: 2,
          title: 'In Progress Task 1',
          description: 'Description 2',
          dueDate: '2025-12-31',
          priority: 'Normal',
          status: 'In Progress',
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01'
        },
        {
          id: 3,
          title: 'In Progress Task 2',
          description: 'Description 3',
          dueDate: '2025-12-31',
          priority: 'Low',
          status: 'In Progress',
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01'
        },
        {
          id: 4,
          title: 'Completed Task 1',
          description: 'Description 4',
          dueDate: '2025-12-31',
          priority: 'High',
          status: 'Completed',
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01'
        },
        {
          id: 5,
          title: 'Completed Task 2',
          description: 'Description 5',
          dueDate: '2025-12-31',
          priority: 'Normal',
          status: 'Completed',
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01'
        }
      ];
      localStorageMock['tasks'] = JSON.stringify(mockTasks);
      service = new TaskService();

      const stats = service.getTaskStatistics();

      expect(stats.total).toBe(5);
      expect(stats.notStarted).toBe(1);
      expect(stats.inProgress).toBe(2);
      expect(stats.completed).toBe(2);
    });

    it('should update statistics after adding a task', () => {
      service.addTask({
        title: 'New Task',
        description: 'Description',
        dueDate: '2025-12-31',
        priority: 'High',
        status: 'Completed'
      });

      const stats = service.getTaskStatistics();

      expect(stats.total).toBe(1);
      expect(stats.completed).toBe(1);
      expect(stats.notStarted).toBe(0);
      expect(stats.inProgress).toBe(0);
    });

    it('should update statistics after deleting a task', () => {
      service.addTask({
        title: 'Task 1',
        description: 'Description 1',
        dueDate: '2025-12-31',
        priority: 'High',
        status: 'Completed'
      });

      service.addTask({
        title: 'Task 2',
        description: 'Description 2',
        dueDate: '2025-12-31',
        priority: 'Normal',
        status: 'Not Started'
      });

      const allTasks = service.getTasksByStatus('All');
      const completedTask = allTasks.find(t => t.status === 'Completed');
      if (completedTask) {
        service.deleteTask(completedTask.id);
      }

      const stats = service.getTaskStatistics();

      expect(stats.total).toBe(1);
      expect(stats.notStarted).toBe(1);
      expect(stats.completed).toBe(0);
    });

    it('should update statistics after updating task status', () => {
      service.addTask({
        title: 'Task 1',
        description: 'Description 1',
        dueDate: '2025-12-31',
        priority: 'High',
        status: 'Not Started'
      });

      const tasks = service.getTasksByStatus('All');
      service.updateTask(tasks[0].id, { status: 'Completed' });

      const stats = service.getTaskStatistics();

      expect(stats.total).toBe(1);
      expect(stats.notStarted).toBe(0);
      expect(stats.completed).toBe(1);
    });
  });
});
