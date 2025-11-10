import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TaskFormComponent } from './task-form.component';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';

describe('TaskFormComponent', () => {
  let component: TaskFormComponent;
  let fixture: ComponentFixture<TaskFormComponent>;
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
      imports: [TaskFormComponent, ReactiveFormsModule],
      providers: [TaskService, FormBuilder]
    });

    fixture = TestBed.createComponent(TaskFormComponent);
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

    it('should initialize form on ngOnInit', () => {
      component.ngOnInit();
      expect(component.taskForm).toBeDefined();
    });

    it('should set formTitle to "New Task" by default', () => {
      component.ngOnInit();
      expect(component.formTitle).toBe('New Task');
    });

    it('should initialize form with default values', () => {
      component.ngOnInit();
      expect(component.taskForm.get('title')?.value).toBe('');
      expect(component.taskForm.get('description')?.value).toBe('');
      expect(component.taskForm.get('dueDate')?.value).toBe('');
      expect(component.taskForm.get('priority')?.value).toBe('Normal');
      expect(component.taskForm.get('status')?.value).toBe('Not Started');
    });
  });

  describe('Form Initialization with Task to Edit', () => {
    it('should set formTitle to "Edit Task" when taskToEdit is provided', () => {
      const taskToEdit: Task = {
        id: 1,
        title: 'Edit Task',
        description: 'Edit Description',
        dueDate: '2025-12-31',
        priority: 'High',
        status: 'In Progress',
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01'
      };

      component.taskToEdit = taskToEdit;
      component.ngOnInit();
      expect(component.formTitle).toBe('Edit Task');
    });

    it('should populate form with task data when taskToEdit is provided', () => {
      const taskToEdit: Task = {
        id: 1,
        title: 'Edit Task',
        description: 'Edit Description',
        dueDate: '2025-12-31',
        priority: 'High',
        status: 'In Progress',
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01'
      };

      component.taskToEdit = taskToEdit;
      component.ngOnInit();

      expect(component.taskForm.get('title')?.value).toBe('Edit Task');
      expect(component.taskForm.get('description')?.value).toBe('Edit Description');
      expect(component.taskForm.get('dueDate')?.value).toBe('2025-12-31');
      expect(component.taskForm.get('priority')?.value).toBe('High');
      expect(component.taskForm.get('status')?.value).toBe('In Progress');
    });

    it('should migrate "Pending" status to "Not Started"', () => {
      const taskToEdit: Task = {
        id: 1,
        title: 'Task',
        description: 'Description',
        dueDate: '2025-12-31',
        priority: 'High',
        status: 'Pending' as any,
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01'
      };

      component.taskToEdit = taskToEdit;
      component.ngOnInit();

      expect(component.taskForm.get('status')?.value).toBe('Not Started');
    });

    it('should migrate "Medium" priority to "Normal"', () => {
      const taskToEdit: Task = {
        id: 1,
        title: 'Task',
        description: 'Description',
        dueDate: '2025-12-31',
        priority: 'Medium' as any,
        status: 'Not Started',
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01'
      };

      component.taskToEdit = taskToEdit;
      component.ngOnInit();

      expect(component.taskForm.get('priority')?.value).toBe('Normal');
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should require title field', () => {
      const titleControl = component.taskForm.get('title');
      expect(titleControl?.hasError('required')).toBe(true);
    });

    it('should require title to have minimum length of 3 characters', () => {
      const titleControl = component.taskForm.get('title');
      titleControl?.setValue('Ab');
      expect(titleControl?.hasError('minlength')).toBe(true);

      titleControl?.setValue('ABC');
      expect(titleControl?.hasError('minlength')).toBe(false);
    });

    it('should require priority field', () => {
      const priorityControl = component.taskForm.get('priority');
      expect(priorityControl).toBeDefined();
      expect(priorityControl?.value).toBe('Normal');
    });

    it('should require status field', () => {
      const statusControl = component.taskForm.get('status');
      expect(statusControl).toBeDefined();
      expect(statusControl?.value).toBe('Not Started');
    });

    it('should be valid when all required fields are filled correctly', () => {
      component.taskForm.patchValue({
        title: 'Valid Task Title',
        description: 'Description',
        dueDate: '2025-12-31',
        priority: 'High',
        status: 'Not Started'
      });

      expect(component.taskForm.valid).toBe(true);
    });

    it('should be invalid when title is empty', () => {
      component.taskForm.patchValue({
        title: '',
        priority: 'High',
        status: 'Not Started'
      });

      expect(component.taskForm.valid).toBe(false);
    });

    it('should be invalid when title is too short', () => {
      component.taskForm.patchValue({
        title: 'Ab',
        priority: 'High',
        status: 'Not Started'
      });

      expect(component.taskForm.valid).toBe(false);
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should not submit if form is invalid', () => {
      component.taskForm.patchValue({
        title: '',
        priority: 'High',
        status: 'Not Started'
      });

      const initialTaskCount = taskService.getTasksByStatus('All').length;
      component.onSubmit();
      const finalTaskCount = taskService.getTasksByStatus('All').length;

      expect(finalTaskCount).toBe(initialTaskCount);
    });

    it('should mark all fields as touched if form is invalid', () => {
      component.taskForm.patchValue({
        title: ''
      });

      component.onSubmit();

      expect(component.taskForm.touched).toBe(true);
    });

    it('should add new task when form is valid and taskToEdit is null', () => {
      component.taskForm.patchValue({
        title: 'New Task',
        description: 'New Description',
        dueDate: '2025-12-31',
        priority: 'High',
        status: 'Not Started'
      });

      const initialTaskCount = taskService.getTasksByStatus('All').length;
      component.onSubmit();
      const finalTaskCount = taskService.getTasksByStatus('All').length;

      expect(finalTaskCount).toBe(initialTaskCount + 1);
    });

    it('should update existing task when taskToEdit is provided', () => {
      taskService.addTask({
        title: 'Original Task',
        description: 'Original Description',
        dueDate: '2025-12-31',
        priority: 'High',
        status: 'Not Started'
      });

      const tasks = taskService.getTasksByStatus('All');
      const taskToEdit = tasks[0];

      component.taskToEdit = taskToEdit;
      component.ngOnInit();

      component.taskForm.patchValue({
        title: 'Updated Task',
        description: 'Updated Description',
        dueDate: '2025-12-31',
        priority: 'Low',
        status: 'Completed'
      });

      const initialTaskCount = taskService.getTasksByStatus('All').length;
      component.onSubmit();
      const finalTaskCount = taskService.getTasksByStatus('All').length;

      expect(finalTaskCount).toBe(initialTaskCount);
      
      const updatedTasks = taskService.getTasksByStatus('All');
      expect(updatedTasks[0].title).toBe('Updated Task');
      expect(updatedTasks[0].status).toBe('Completed');
    });

    it('should trim title and description before saving', () => {
      component.taskForm.patchValue({
        title: '  Trimmed Title  ',
        description: '  Trimmed Description  ',
        dueDate: '2025-12-31',
        priority: 'High',
        status: 'Not Started'
      });

      component.onSubmit();
      const tasks = taskService.getTasksByStatus('All');
      const savedTask = tasks[tasks.length - 1];

      expect(savedTask.title).toBe('Trimmed Title');
      expect(savedTask.description).toBe('Trimmed Description');
    });

    it('should emit taskSaved event after successful submission', (done) => {
      component.taskForm.patchValue({
        title: 'New Task',
        description: 'Description',
        dueDate: '2025-12-31',
        priority: 'High',
        status: 'Not Started'
      });

      component.taskSaved.subscribe(() => {
        done();
      });

      component.onSubmit();
    });

    it('should reset form after successful submission', () => {
      component.taskForm.patchValue({
        title: 'New Task',
        description: 'Description',
        dueDate: '2025-12-31',
        priority: 'High',
        status: 'Not Started'
      });

      component.onSubmit();

      expect(component.taskForm.get('title')?.value).toBeNull();
      expect(component.taskForm.get('description')?.value).toBeNull();
      expect(component.taskForm.get('priority')?.value).toBe('Normal');
      expect(component.taskForm.get('status')?.value).toBe('Not Started');
    });
  });

  describe('Form Cancellation', () => {
    it('should emit cancel event when onCancel is called', (done) => {
      component.cancel.subscribe(() => {
        done();
      });

      component.onCancel();
    });
  });

  describe('Form Controls Accessor', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should provide access to form controls via f getter', () => {
      expect(component.f).toBeDefined();
      expect(component.f['title']).toBeDefined();
      expect(component.f['description']).toBeDefined();
      expect(component.f['priority']).toBeDefined();
      expect(component.f['status']).toBeDefined();
    });

    it('should allow access to control values via f getter', () => {
      component.taskForm.patchValue({
        title: 'Test Title'
      });

      expect(component.f['title'].value).toBe('Test Title');
    });
  });

  describe('UI Template Rendering', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should render form element', () => {
      const formElement = fixture.debugElement.query(By.css('form'));
      expect(formElement).toBeTruthy();
    });

    it('should render title input field', () => {
      const titleInput = fixture.debugElement.query(By.css('input[formControlName="title"]'));
      expect(titleInput).toBeTruthy();
    });

    it('should render status select field', () => {
      const statusSelect = fixture.debugElement.query(By.css('select[formControlName="status"]'));
      expect(statusSelect).toBeTruthy();
    });

    it('should render priority select field', () => {
      const prioritySelect = fixture.debugElement.query(By.css('select[formControlName="priority"]'));
      expect(prioritySelect).toBeTruthy();
    });

    it('should render description textarea', () => {
      const descriptionTextarea = fixture.debugElement.query(By.css('textarea[formControlName="description"]'));
      expect(descriptionTextarea).toBeTruthy();
    });

    it('should render due date input field', () => {
      const dueDateInput = fixture.debugElement.query(By.css('input[formControlName="dueDate"]'));
      expect(dueDateInput).toBeTruthy();
    });

    it('should render Save button', () => {
      const saveButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(saveButton).toBeTruthy();
    });

    it('should render Cancel button', () => {
      const cancelButton = fixture.debugElement.query(By.css('button.cancel-btn'));
      expect(cancelButton).toBeTruthy();
    });

    it('should have Save button disabled when form is invalid', () => {
      component.taskForm.patchValue({ title: '' });
      fixture.detectChanges();
      const saveButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(saveButton.nativeElement.disabled).toBe(true);
    });

    it('should have Save button enabled when form is valid', () => {
      component.taskForm.patchValue({
        title: 'Valid Task Title',
        priority: 'High',
        status: 'Not Started'
      });
      fixture.detectChanges();
      const saveButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(saveButton.nativeElement.disabled).toBe(false);
    });

    it('should apply error class to title input when invalid and touched', () => {
      const titleInput = fixture.debugElement.query(By.css('input[formControlName="title"]'));
      component.taskForm.get('title')?.markAsTouched();
      component.taskForm.patchValue({ title: '' });
      fixture.detectChanges();
      
      expect(titleInput.nativeElement.classList.contains('slds-has-error')).toBe(true);
    });

    it('should not apply error class to title input when valid', () => {
      component.taskForm.patchValue({ title: 'Valid Title' });
      fixture.detectChanges();
      const titleInput = fixture.debugElement.query(By.css('input[formControlName="title"]'));
      
      expect(titleInput.nativeElement.classList.contains('slds-has-error')).toBe(false);
    });

    it('should display placeholder text in title input', () => {
      const titleInput = fixture.debugElement.query(By.css('input[formControlName="title"]'));
      expect(titleInput.nativeElement.placeholder).toBe('User 1');
    });

    it('should display placeholder text in description textarea', () => {
      const descriptionTextarea = fixture.debugElement.query(By.css('textarea[formControlName="description"]'));
      expect(descriptionTextarea.nativeElement.placeholder).toBe('Enter task description');
    });
  });

  describe('User Interactions', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should update form value when user types in title input', () => {
      const titleInput = fixture.debugElement.query(By.css('input[formControlName="title"]'));
      titleInput.nativeElement.value = 'New Task Title';
      titleInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(component.taskForm.get('title')?.value).toBe('New Task Title');
    });

    it('should update form value when user selects status', () => {
      const statusSelect = fixture.debugElement.query(By.css('select[formControlName="status"]'));
      statusSelect.nativeElement.value = 'In Progress';
      statusSelect.nativeElement.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      expect(component.taskForm.get('status')?.value).toBe('In Progress');
    });

    it('should update form value when user selects priority', () => {
      const prioritySelect = fixture.debugElement.query(By.css('select[formControlName="priority"]'));
      prioritySelect.nativeElement.value = 'High';
      prioritySelect.nativeElement.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      expect(component.taskForm.get('priority')?.value).toBe('High');
    });

    it('should call onSubmit when form is submitted', () => {
      spyOn(component, 'onSubmit');
      component.taskForm.patchValue({
        title: 'Test Task',
        priority: 'High',
        status: 'Not Started'
      });
      fixture.detectChanges();

      const form = fixture.debugElement.query(By.css('form'));
      form.triggerEventHandler('ngSubmit', null);
      fixture.detectChanges();

      expect(component.onSubmit).toHaveBeenCalled();
    });

    it('should call onCancel when Cancel button is clicked', () => {
      spyOn(component, 'onCancel');
      const cancelButton = fixture.debugElement.query(By.css('button.cancel-btn'));
      cancelButton.triggerEventHandler('click', null);
      fixture.detectChanges();

      expect(component.onCancel).toHaveBeenCalled();
    });

    it('should emit cancel event when Cancel button is clicked', () => {
      spyOn(component.cancel, 'emit');
      const cancelButton = fixture.debugElement.query(By.css('button.cancel-btn'));
      cancelButton.triggerEventHandler('click', null);
      fixture.detectChanges();

      expect(component.cancel.emit).toHaveBeenCalled();
    });

    it('should not submit form when Save button is clicked and form is invalid', () => {
      spyOn(component, 'onSubmit');
      component.taskForm.patchValue({ title: '' });
      fixture.detectChanges();

      const saveButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      saveButton.nativeElement.click();
      fixture.detectChanges();

      expect(component.onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Form Validation UI Feedback', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should show error state on title input after form submission with invalid data', () => {
      component.taskForm.patchValue({ title: '' });
      component.onSubmit();
      fixture.detectChanges();

      const titleInput = fixture.debugElement.query(By.css('input[formControlName="title"]'));
      expect(titleInput.nativeElement.classList.contains('slds-has-error')).toBe(true);
    });

    it('should show error state on status select when invalid and touched', () => {
      const statusSelect = fixture.debugElement.query(By.css('select[formControlName="status"]'));
      component.taskForm.get('status')?.setValue('');
      component.taskForm.get('status')?.markAsTouched();
      fixture.detectChanges();

      expect(statusSelect.nativeElement.classList.contains('slds-has-error')).toBe(false);
    });

    it('should show error state on priority select when invalid and touched', () => {
      const prioritySelect = fixture.debugElement.query(By.css('select[formControlName="priority"]'));
      component.taskForm.get('priority')?.setValue('');
      component.taskForm.get('priority')?.markAsTouched();
      fixture.detectChanges();

      expect(prioritySelect.nativeElement.classList.contains('slds-has-error')).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should handle empty description', () => {
      component.taskForm.patchValue({
        title: 'Task with Empty Description',
        description: '',
        dueDate: '2025-12-31',
        priority: 'High',
        status: 'Not Started'
      });

      expect(component.taskForm.valid).toBe(true);
      
      component.onSubmit();
      const tasks = taskService.getTasksByStatus('All');
      const savedTask = tasks[tasks.length - 1];

      expect(savedTask.description).toBe('');
    });

    it('should handle empty dueDate', () => {
      component.taskForm.patchValue({
        title: 'Task without Due Date',
        description: 'Description',
        dueDate: '',
        priority: 'High',
        status: 'Not Started'
      });

      expect(component.taskForm.valid).toBe(true);
    });

    it('should handle very long title', () => {
      const longTitle = 'A'.repeat(100);
      component.taskForm.patchValue({
        title: longTitle,
        priority: 'High',
        status: 'Not Started'
      });

      expect(component.taskForm.valid).toBe(true);
    });

    it('should handle special characters in title and description', () => {
      component.taskForm.patchValue({
        title: 'Task with !@#$%^&*()',
        description: 'Description with <script>alert("test")</script>',
        dueDate: '2025-12-31',
        priority: 'High',
        status: 'Not Started'
      });

      expect(component.taskForm.valid).toBe(true);
      
      component.onSubmit();
      const tasks = taskService.getTasksByStatus('All');
      const savedTask = tasks[tasks.length - 1];

      expect(savedTask.title).toBe('Task with !@#$%^&*()');
    });
  });
});
