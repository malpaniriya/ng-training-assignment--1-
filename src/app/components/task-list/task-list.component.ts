
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { Task, TaskFilter } from '../../models/task.model';
import { TaskFormComponent } from '../task-form/task-form.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TaskFormComponent],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  filter: TaskFilter = { status: 'All' };
  statistics: any;
  searchText: string = '';
  selectedTask: Task | null = null;
  showForm: boolean = false;
  showDeleteConfirm: boolean=false;
  taskToDelete: any;
  selectedTasks: Set<number> = new Set<number>();
  selectAll: boolean = false;
  openDropdownId: number | null = null;

  constructor(public taskService: TaskService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.tasks = this.taskService.getTasksByStatus(this.filter.status);
    this.statistics = this.taskService.getTaskStatistics();
    this.selectedTasks.clear();
    this.selectAll = false;
  }

  onFilterChange(status: string): void {
    this.filter.status = status as TaskFilter['status'];
    this.loadTasks();
  }

  onSearch(): void {
    const search = this.searchText?.toLowerCase() || '';
    this.tasks = this.taskService.getTasksByStatus(this.filter.status).filter(task =>
      task.title.toLowerCase().includes(search) ||
      task.description.toLowerCase().includes(search)
    );
    this.selectedTasks.clear();
    this.selectAll = false;
  }

  closeForm(): void {
    this.showForm = false;
  }

  onTaskSaved(): void {
    this.loadTasks();
    this.closeForm();
  }

  onEditTask(task: Task): void {
    this.selectedTask = { ...task };
    this.showForm = true;
  }

  openForm(): void {
    this.selectedTask = null;
    this.showForm = true;
  }

  onDeleteTask(task: Task): void {
    this.taskToDelete = task;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.taskToDelete = null;
    this.showDeleteConfirm = false;
  }

  confirmDelete(): void {
    if (this.taskToDelete) {
      this.selectedTasks.delete(this.taskToDelete.id);
      this.taskService.deleteTask(this.taskToDelete.id);
      this.loadTasks();
      this.selectAll = this.selectedTasks.size === this.tasks.length && this.tasks.length > 0;
    }
    this.showDeleteConfirm = false;
    this.taskToDelete = null;
  }

  onSelectAll(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.selectAll = target.checked;

    if (this.selectAll) {
      this.tasks.forEach(task => {
        this.selectedTasks.add(task.id);
      });
    } else {
      this.selectedTasks.clear();
    }
  }

  onSelectTask(taskId: number, event: Event): void {
    event.stopPropagation();
    const target = event.target as HTMLInputElement;
    const isChecked = target.checked;

    if (isChecked) {
      this.selectedTasks.add(taskId);
    } else {
      this.selectedTasks.delete(taskId);
    }

    this.selectAll = this.selectedTasks.size === this.tasks.length && this.tasks.length > 0;
  }

  isTaskSelected(taskId: number): boolean {
    return this.selectedTasks.has(taskId);
  }

  toggleDropdown(taskId: number, event: Event): void {
    event.stopPropagation();
    if (this.openDropdownId === taskId) {
      this.openDropdownId = null;
    } else {
      this.openDropdownId = taskId;
    }
  }

  isDropdownOpen(taskId: number): boolean {
    return this.openDropdownId === taskId;
  }

  closeDropdown(): void {
    this.openDropdownId = null;
  }

}
