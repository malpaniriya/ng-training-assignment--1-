
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasks: Task[] = [];

  constructor() {
    this.loadTasksFromStorage();
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage;
  }

  private loadTasksFromStorage(): void {
    if (!this.isBrowser()) return; 
    try {
      const data = localStorage.getItem('tasks');
      this.tasks = data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading tasks from storage:', error);
      this.tasks = [];
    }
  }

  private saveTasksToStorage(): void {
    if (!this.isBrowser()) return;
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }

  getTasksByStatus(status: string): Task[] {
    if (status === 'All') return this.tasks;
    return this.tasks.filter(t => t.status === status);
  }

  addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): void {
    const newTask: Task = {
      ...task,
      id: Date.now(),
    createdAt: new Date().toISOString(),
updatedAt: new Date().toISOString()

    };
    this.tasks.push(newTask);
    this.saveTasksToStorage();
  }

  deleteTask(id: number): void {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.saveTasksToStorage();
  }

  updateTask(id: number, updates: Partial<Task>): void {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      Object.assign(task, updates, { updatedAt: new Date() });
      this.saveTasksToStorage();
    }
  }

  getTaskStatistics() {
    const total = this.tasks.length;
    const completed = this.tasks.filter(t => t.status === 'Completed').length;
    const notStarted = this.tasks.filter(t => t.status === 'Not Started').length;
    const inProgress = this.tasks.filter(t => t.status === 'In Progress').length;

    return { total, completed, notStarted, inProgress };
  }
}
