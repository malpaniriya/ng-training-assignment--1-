
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.css']
})
export class TaskFormComponent implements OnInit {
  @Input() taskToEdit: Task | null = null;

  @Output() taskSaved = new EventEmitter<void>();

  @Output() cancel = new EventEmitter<void>();

  taskForm!: FormGroup;
  formTitle = 'New Task'; 

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    this.initializeForm();

    if (this.taskToEdit) {
      this.formTitle = 'Edit Task';
      const taskData = {
        ...this.taskToEdit,
        status: this.migrateStatus(this.taskToEdit.status),
        priority: this.migratePriority(this.taskToEdit.priority)
      };
      this.taskForm.patchValue(taskData);
    }
  }

  private migrateStatus(status: string): string {
    if (status === 'Pending') {
      return 'Not Started';
    }
    return status;
  }

  private migratePriority(priority: string): string {
    if (priority === 'Medium') {
      return 'Normal';
    }
    return priority;
  }

  private initializeForm(): void {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      dueDate: [''],
      priority: ['Normal', Validators.required],
      status: ['Not Started', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const formData = this.taskForm.value;

    const taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      dueDate: formData.dueDate,
      priority: formData.priority,
      status: formData.status
    };

    if (this.taskToEdit) {
      this.taskService.updateTask(this.taskToEdit.id, taskData);
    } else {
      this.taskService.addTask(taskData);
    }

    this.taskSaved.emit(); 
    this.taskForm.reset({
      priority: 'Normal',
      status: 'Not Started'
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }

  get f() {
    return this.taskForm.controls;
  }
  
}
