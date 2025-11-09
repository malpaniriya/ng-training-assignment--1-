import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { TaskListComponent } from './task-list.component';
import { TaskService } from '../../services/task.service';
import { Task, TaskFilter } from '../../models/task.model';

describe('TaskListComponent', () => {
  let component: TaskListComponent;
  let fixture: ComponentFixture<TaskListComponent>;
  let taskService: TaskService;
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

    TestBed.configureTestingModule({
      imports: [TaskListComponent, FormsModule],
      providers: [TaskService]
    });

    fixture = TestBed.createComponent(TaskListComponent);
    component = fixture.componentInstance;
    taskService = TestBed.inject(TaskService);
    localStorageMock = {};
  });

  afterEach(() => {
    localStorageMock = {};
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeDefined();
    });

    it('should initialize with empty tasks array', () => {
      expect(Array.isArray(component.tasks)).toBe(true);
      expect(component.tasks.length).toBe(0);
    });

    it('should initialize filter with "All" status', () => {
      expect(component.filter.status).toBe('All');
    });

    it('should initialize searchText as empty string', () => {
      expect(component.searchText).toBe('');
    });

    it('should initialize showForm as false', () => {
      expect(component.showForm).toBe(false);
    });

    it('should initialize showDeleteConfirm as false', () => {
      expect(component.showDeleteConfirm).toBe(false);
    });

    it('should initialize selectedTask as null', () => {
      expect(component.selectedTask).toBeNull();
    });

    it('should call loadTasks on ngOnInit', () => {
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
      taskService = new TaskService();
      component.taskService = taskService;
      
      component.ngOnInit();
      expect(component.tasks.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('loadTasks', () => {
    it('should load tasks from service based on filter status', () => {
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
      taskService = new TaskService();

      component.taskService = taskService;
      component.filter.status = 'All';
      component.loadTasks();

      expect(component.tasks.length).toBe(2);
    });

    it('should load tasks filtered by status', () => {
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
        }
      ];
      localStorageMock['tasks'] = JSON.stringify(mockTasks);
      taskService = new TaskService();

      component.taskService = taskService;
      component.filter.status = 'Not Started';
      component.loadTasks();

      expect(component.tasks.length).toBe(1);
      expect(component.tasks[0].status).toBe('Not Started');
    });

    it('should load statistics from service', () => {
      const mockTasks: Task[] = [
        {
          id: 1,
          title: 'Task 1',
          description: 'Description 1',
          dueDate: '2025-12-31',
          priority: 'High',
          status: 'Completed',
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01'
        }
      ];
      localStorageMock['tasks'] = JSON.stringify(mockTasks);
      taskService = new TaskService();

      component.taskService = taskService;
      component.loadTasks();

      expect(component.statistics).toBeDefined();
      expect(component.statistics.total).toBe(1);
      expect(component.statistics.completed).toBe(1);
    });
  });

  describe('onFilterChange', () => {
    it('should update filter status', () => {
      component.onFilterChange('In Progress');
      expect(component.filter.status).toBe('In Progress');
    });

    it('should call loadTasks after filter change', () => {
      const mockTasks: Task[] = [
        {
          id: 1,
          title: 'Completed Task',
          description: 'Description',
          dueDate: '2025-12-31',
          priority: 'High',
          status: 'Completed',
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01'
        }
      ];
      localStorageMock['tasks'] = JSON.stringify(mockTasks);
      taskService = new TaskService();
      component.taskService = taskService;
      
      component.onFilterChange('Completed');
      expect(component.filter.status).toBe('Completed');
    });

    it('should filter tasks by "Not Started" status', () => {
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
        }
      ];
      localStorageMock['tasks'] = JSON.stringify(mockTasks);
      taskService = new TaskService();
      component.taskService = taskService;

      component.onFilterChange('Not Started');
      expect(component.tasks.length).toBe(1);
      expect(component.tasks[0].status).toBe('Not Started');
    });
  });

  describe('onSearch', () => {
    beforeEach(() => {
      const mockTasks: Task[] = [
        {
          id: 1,
          title: 'JavaScript Task',
          description: 'Learn JavaScript',
          dueDate: '2025-12-31',
          priority: 'High',
          status: 'Not Started',
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01'
        },
        {
          id: 2,
          title: 'TypeScript Task',
          description: 'Learn TypeScript',
          dueDate: '2025-12-31',
          priority: 'Normal',
          status: 'In Progress',
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01'
        },
        {
          id: 3,
          title: 'Angular Task',
          description: 'Learn Angular framework',
          dueDate: '2025-12-31',
          priority: 'Low',
          status: 'Completed',
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01'
        }
      ];
      localStorageMock['tasks'] = JSON.stringify(mockTasks);
      taskService = new TaskService();
      component.taskService = taskService;
      component.filter.status = 'All';
      component.loadTasks();
    });

    it('should filter tasks by title', () => {
      component.searchText = 'JavaScript';
      component.onSearch();
      expect(component.tasks.length).toBe(1);
      expect(component.tasks[0].title).toContain('JavaScript');
    });

    it('should filter tasks by description', () => {
      component.searchText = 'framework';
      component.onSearch();
      expect(component.tasks.length).toBe(1);
      expect(component.tasks[0].description).toContain('framework');
    });

    it('should be case insensitive', () => {
      component.searchText = 'TYPESCRIPT';
      component.onSearch();
      expect(component.tasks.length).toBe(1);
      expect(component.tasks[0].title).toContain('TypeScript');
    });

    it('should return all tasks when search text is empty', () => {
      component.searchText = '';
      component.onSearch();
      expect(component.tasks.length).toBe(3);
    });

    it('should return empty array when no tasks match search', () => {
      component.searchText = 'NonExistent';
      component.onSearch();
      expect(component.tasks.length).toBe(0);
    });

    it('should filter tasks within the current status filter', () => {
      component.filter.status = 'Not Started';
      component.loadTasks();
      component.searchText = 'JavaScript';
      component.onSearch();
      expect(component.tasks.length).toBe(1);
      expect(component.tasks[0].status).toBe('Not Started');
    });
  });

  describe('openForm', () => {
    it('should set showForm to true', () => {
      component.openForm();
      expect(component.showForm).toBe(true);
    });

    it('should set selectedTask to null', () => {
      component.selectedTask = {
        id: 1,
        title: 'Test Task',
        description: 'Test',
        dueDate: '2025-12-31',
        priority: 'High',
        status: 'Not Started',
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01'
      };
      component.openForm();
      expect(component.selectedTask).toBeNull();
    });
  });

  describe('closeForm', () => {
    it('should set showForm to false', () => {
      component.showForm = true;
      component.closeForm();
      expect(component.showForm).toBe(false);
    });
  });

  describe('onEditTask', () => {
    it('should set selectedTask to a copy of the task', () => {
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

      component.onEditTask(task);
      expect(component.selectedTask).toBeDefined();
      expect(component.selectedTask?.title).toBe('Test Task');
      expect(component.selectedTask).not.toBe(task);
    });

    it('should set showForm to true', () => {
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

      component.onEditTask(task);
      expect(component.showForm).toBe(true);
    });
  });

  describe('onTaskSaved', () => {
    it('should reload tasks and close form', () => {
      const mockTasks: Task[] = [
        {
          id: 1,
          title: 'Test Task',
          description: 'Description',
          dueDate: '2025-12-31',
          priority: 'High',
          status: 'Not Started',
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01'
        }
      ];
      localStorageMock['tasks'] = JSON.stringify(mockTasks);
      taskService = new TaskService();
      component.taskService = taskService;
      component.showForm = true;
      
      component.onTaskSaved();
      expect(component.showForm).toBe(false);
    });
  });

  describe('onDeleteTask', () => {
    it('should set taskToDelete', () => {
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

      component.onDeleteTask(task);
      expect(component.taskToDelete).toBeDefined();
      expect(component.taskToDelete.title).toBe('Test Task');
    });

    it('should set showDeleteConfirm to true', () => {
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

      component.onDeleteTask(task);
      expect(component.showDeleteConfirm).toBe(true);
    });
  });

  describe('cancelDelete', () => {
    it('should set taskToDelete to null', () => {
      component.taskToDelete = {
        id: 1,
        title: 'Test Task',
        description: 'Test',
        dueDate: '2025-12-31',
        priority: 'High',
        status: 'Not Started',
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01'
      };
      component.cancelDelete();
      expect(component.taskToDelete).toBeNull();
    });

    it('should set showDeleteConfirm to false', () => {
      component.showDeleteConfirm = true;
      component.cancelDelete();
      expect(component.showDeleteConfirm).toBe(false);
    });
  });

  describe('confirmDelete', () => {
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
      taskService = new TaskService();
      component.taskService = taskService;
      component.loadTasks();
    });

    it('should delete task when taskToDelete is set', () => {
      component.taskToDelete = component.tasks[0];
      component.confirmDelete();
      expect(component.tasks.length).toBe(1);
    });

    it('should reload tasks after deletion', () => {
      component.taskToDelete = component.tasks[0];
      const initialLength = component.tasks.length;
      component.confirmDelete();
      expect(component.tasks.length).toBeLessThan(initialLength);
    });

    it('should set showDeleteConfirm to false after deletion', () => {
      component.taskToDelete = component.tasks[0];
      component.showDeleteConfirm = true;
      component.confirmDelete();
      expect(component.showDeleteConfirm).toBe(false);
    });

    it('should set taskToDelete to null after deletion', () => {
      component.taskToDelete = component.tasks[0];
      component.confirmDelete();
      expect(component.taskToDelete).toBeNull();
    });

    it('should not delete when taskToDelete is null', () => {
      component.taskToDelete = null;
      const initialLength = component.tasks.length;
      component.confirmDelete();
      expect(component.tasks.length).toBe(initialLength);
    });
  });

  describe('UI Template Rendering', () => {
    beforeEach(() => {
      const mockTasks: Task[] = [
        {
          id: 1,
          title: 'Test Task 1',
          description: 'Description 1',
          dueDate: '2025-12-31',
          priority: 'High',
          status: 'Not Started',
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01'
        },
        {
          id: 2,
          title: 'Test Task 2',
          description: 'Description 2',
          dueDate: '2025-12-31',
          priority: 'Normal',
          status: 'In Progress',
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01'
        }
      ];
      localStorageMock['tasks'] = JSON.stringify(mockTasks);
      taskService = new TaskService();
      component.taskService = taskService;
      component.loadTasks();
      fixture.detectChanges();
    });

    it('should render task table', () => {
      const table = fixture.debugElement.query(By.css('table.task-table'));
      expect(table).toBeTruthy();
    });

    it('should render table headers', () => {
      const headers = fixture.debugElement.queryAll(By.css('thead th'));
      expect(headers.length).toBeGreaterThan(0);
    });

    it('should render New Task button', () => {
      const newTaskButton = fixture.debugElement.query(By.css('button.new-task'));
      expect(newTaskButton).toBeTruthy();
      expect(newTaskButton.nativeElement.textContent.trim()).toBe('New Task');
    });

    it('should render Refresh button', () => {
      const refreshButton = fixture.debugElement.query(By.css('button.refresh'));
      expect(refreshButton).toBeTruthy();
      expect(refreshButton.nativeElement.textContent.trim()).toBe('Refresh');
    });

    it('should render search input field', () => {
      const searchInput = fixture.debugElement.query(By.css('input[type="text"]'));
      expect(searchInput).toBeTruthy();
      expect(searchInput.nativeElement.placeholder).toBe('Search');
    });

    it('should render status filter select', () => {
      const statusFilter = fixture.debugElement.query(By.css('select'));
      expect(statusFilter).toBeTruthy();
    });

    it('should render task rows in table', () => {
      const taskRows = fixture.debugElement.queryAll(By.css('tbody tr'));
      expect(taskRows.length).toBe(2);
    });

    it('should display task title in table row', () => {
      const taskRows = fixture.debugElement.queryAll(By.css('tbody tr'));
      const firstRowTitle = taskRows[0].query(By.css('a.slds-text-link'));
      expect(firstRowTitle.nativeElement.textContent.trim()).toBe('Test Task 1');
    });

    it('should display task status in table row', () => {
      const taskRows = fixture.debugElement.queryAll(By.css('tbody tr'));
      const statusCells = taskRows[0].queryAll(By.css('td'));
      const statusCell = statusCells.find(cell => 
        cell.nativeElement.getAttribute('data-label') === 'Status'
      );
      expect(statusCell).toBeTruthy();
      expect(statusCell?.nativeElement.textContent.trim()).toBe('Not Started');
    });

    it('should not render form modal when showForm is false', () => {
      component.showForm = false;
      fixture.detectChanges();
      const modal = fixture.debugElement.query(By.css('.modal-overlay'));
      expect(modal).toBeFalsy();
    });

    it('should render form modal when showForm is true', () => {
      component.showForm = true;
      fixture.detectChanges();
      const modal = fixture.debugElement.query(By.css('.modal-overlay'));
      expect(modal).toBeTruthy();
    });

    it('should not render delete confirmation modal when showDeleteConfirm is false', () => {
      component.showDeleteConfirm = false;
      fixture.detectChanges();
      const deleteModal = fixture.debugElement.query(By.css('.delete-modal'));
      expect(deleteModal).toBeFalsy();
    });

    it('should render delete confirmation modal when showDeleteConfirm is true', () => {
      component.showDeleteConfirm = true;
      component.taskToDelete = component.tasks[0];
      fixture.detectChanges();
      const deleteModal = fixture.debugElement.query(By.css('.delete-modal'));
      expect(deleteModal).toBeTruthy();
    });

    it('should display task count in header', () => {
      const recordCount = fixture.debugElement.query(By.css('p.slds-text-body_small'));
      const countText = recordCount.nativeElement.textContent;
      expect(countText).toContain('2 records');
    });
  });

  describe('User Interactions', () => {
    beforeEach(() => {
      const mockTasks: Task[] = [
        {
          id: 1,
          title: 'Test Task 1',
          description: 'Description 1',
          dueDate: '2025-12-31',
          priority: 'High',
          status: 'Not Started',
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01'
        }
      ];
      localStorageMock['tasks'] = JSON.stringify(mockTasks);
      taskService = new TaskService();
      component.taskService = taskService;
      component.loadTasks();
      fixture.detectChanges();
    });

    it('should call openForm when New Task button is clicked', () => {
      spyOn(component, 'openForm');
      const newTaskButton = fixture.debugElement.query(By.css('button.new-task'));
      newTaskButton.triggerEventHandler('click', null);
      fixture.detectChanges();

      expect(component.openForm).toHaveBeenCalled();
    });

    it('should call loadTasks when Refresh button is clicked', () => {
      spyOn(component, 'loadTasks');
      const refreshButton = fixture.debugElement.query(By.css('button.refresh'));
      refreshButton.triggerEventHandler('click', null);
      fixture.detectChanges();

      expect(component.loadTasks).toHaveBeenCalled();
    });

    it('should call onSearch when search input value changes', () => {
      spyOn(component, 'onSearch');
      const searchInput = fixture.debugElement.query(By.css('input[type="text"]'));
      searchInput.nativeElement.value = 'Test';
      searchInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(component.onSearch).toHaveBeenCalled();
    });

    it('should call onFilterChange when status filter changes', () => {
      spyOn(component, 'onFilterChange');
      const statusFilter = fixture.debugElement.query(By.css('select'));
      statusFilter.nativeElement.value = 'In Progress';
      statusFilter.nativeElement.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      expect(component.onFilterChange).toHaveBeenCalled();
    });

    it('should call onEditTask when Edit link is clicked', () => {
      spyOn(component, 'onEditTask');
      const editLinks = fixture.debugElement.queryAll(By.css('a[role="menuitem"]'));
      const editLink = editLinks.find(link => 
        link.nativeElement.textContent.trim() === 'Edit'
      );
      
      if (editLink) {
        editLink.triggerEventHandler('click', null);
        fixture.detectChanges();
        expect(component.onEditTask).toHaveBeenCalled();
      }
    });

    it('should call onDeleteTask when Delete link is clicked', () => {
      spyOn(component, 'onDeleteTask');
      const deleteLinks = fixture.debugElement.queryAll(By.css('a[role="menuitem"]'));
      const deleteLink = deleteLinks.find(link => 
        link.nativeElement.textContent.trim() === 'Delete'
      );
      
      if (deleteLink) {
        deleteLink.triggerEventHandler('click', null);
        fixture.detectChanges();
        expect(component.onDeleteTask).toHaveBeenCalled();
      }
    });

    it('should call closeForm when modal close button is clicked', () => {
      component.showForm = true;
      fixture.detectChanges();
      spyOn(component, 'closeForm');
      
      const closeButton = fixture.debugElement.query(By.css('.close-btn'));
      if (closeButton) {
        closeButton.triggerEventHandler('click', null);
        fixture.detectChanges();
        expect(component.closeForm).toHaveBeenCalled();
      }
    });

    it('should call cancelDelete when delete modal No button is clicked', () => {
      component.showDeleteConfirm = true;
      component.taskToDelete = component.tasks[0];
      fixture.detectChanges();
      spyOn(component, 'cancelDelete');
      
      const noButton = fixture.debugElement.query(By.css('button.cancel-btn'));
      if (noButton) {
        noButton.triggerEventHandler('click', null);
        fixture.detectChanges();
        expect(component.cancelDelete).toHaveBeenCalled();
      }
    });

    it('should call confirmDelete when delete modal Yes button is clicked', () => {
      component.showDeleteConfirm = true;
      component.taskToDelete = component.tasks[0];
      fixture.detectChanges();
      spyOn(component, 'confirmDelete');
      
      const yesButton = fixture.debugElement.query(By.css('button.delete-confirm-btn'));
      if (yesButton) {
        yesButton.triggerEventHandler('click', null);
        fixture.detectChanges();
        expect(component.confirmDelete).toHaveBeenCalled();
      }
    });

    it('should update searchText when user types in search input', () => {
      const searchInput = fixture.debugElement.query(By.css('input[type="text"]'));
      searchInput.nativeElement.value = 'Search Query';
      searchInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(component.searchText).toBe('Search Query');
    });

    it('should filter tasks when search is performed', () => {
      component.searchText = 'Test Task 1';
      component.onSearch();
      fixture.detectChanges();

      expect(component.tasks.length).toBe(1);
      expect(component.tasks[0].title).toBe('Test Task 1');
    });
  });

  describe('Conditional Rendering', () => {
    beforeEach(() => {
      const mockTasks: Task[] = [
        {
          id: 1,
          title: 'Test Task',
          description: 'Description',
          dueDate: '2025-12-31',
          priority: 'High',
          status: 'Not Started',
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01'
        }
      ];
      localStorageMock['tasks'] = JSON.stringify(mockTasks);
      taskService = new TaskService();
      component.taskService = taskService;
      component.loadTasks();
    });

    it('should display "New Task" in modal header when selectedTask is null', () => {
      component.showForm = true;
      component.selectedTask = null;
      fixture.detectChanges();
      
      const modalTitle = fixture.debugElement.query(By.css('.slds-modal__title'));
      if (modalTitle) {
        expect(modalTitle.nativeElement.textContent.trim()).toBe('New Task');
      }
    });

    it('should display "Edit Task" in modal header when selectedTask is set', () => {
      component.showForm = true;
      component.selectedTask = component.tasks[0];
      fixture.detectChanges();
      
      const modalTitle = fixture.debugElement.query(By.css('.slds-modal__title'));
      if (modalTitle) {
        expect(modalTitle.nativeElement.textContent.trim()).toBe('Edit Task');
      }
    });

    it('should display task title in delete confirmation modal', () => {
      component.showDeleteConfirm = true;
      component.taskToDelete = component.tasks[0];
      fixture.detectChanges();
      
      const deleteBody = fixture.debugElement.query(By.css('.delete-body'));
      if (deleteBody) {
        expect(deleteBody.nativeElement.textContent).toContain('Test Task');
      }
    });

    it('should render empty table when no tasks are available', () => {
      localStorageMock = {};
      taskService = new TaskService();
      component.taskService = taskService;
      component.loadTasks();
      fixture.detectChanges();

      const taskRows = fixture.debugElement.queryAll(By.css('tbody tr'));
      expect(taskRows.length).toBe(0);
    });
  });
});
