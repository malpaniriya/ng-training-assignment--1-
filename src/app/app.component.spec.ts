import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { TaskService } from './services/task.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let localStorageMock: { [key: string]: string };

  beforeEach(async () => {
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

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [TaskService]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorageMock = {};
  });

  describe('Component Initialization', () => {
    it('should create the app', () => {
      expect(component).toBeDefined();
    });

    it('should have the title property', () => {
      expect(component.title).toBe('ng-training-assignment-1');
    });
  });

  describe('UI Template Rendering', () => {
    it('should render slds-scope div', () => {
      const scopeDiv = fixture.debugElement.query(By.css('.slds-scope'));
      expect(scopeDiv).toBeTruthy();
    });

    it('should render task-list component', () => {
      const taskList = fixture.debugElement.query(By.css('app-task-list'));
      expect(taskList).toBeTruthy();
    });

    it('should not render h1 element (removed from template)', () => {
      const h1Element = fixture.debugElement.query(By.css('h1'));
      expect(h1Element).toBeFalsy();
    });
  });
});
