import { Injectable, signal } from '@angular/core';
import {
  AuthenticatedUser,
  DetailHistoryEntry,
} from '../models/app.models';
import { formatDuration } from '../utils/time-utils';

@Injectable({ providedIn: 'root' })
export class AppStateService {
  private readonly currentUserSignal = signal<AuthenticatedUser | null>(null);
  private readonly loginAtSignal = signal<Date | null>(null);
  private readonly clickCountSignal = signal(0);
  private readonly filterTextSignal = signal('');
  private readonly historySignal = signal<DetailHistoryEntry[]>([]);
  private readonly lastLogoutDurationSignal = signal<string | null>(null);
  private nextHistoryId = 1;

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly loginAt = this.loginAtSignal.asReadonly();
  readonly clickCount = this.clickCountSignal.asReadonly();
  readonly filterText = this.filterTextSignal.asReadonly();
  readonly history = this.historySignal.asReadonly();
  readonly lastLogoutDuration = this.lastLogoutDurationSignal.asReadonly();

  startSession(user: AuthenticatedUser): void {
    this.currentUserSignal.set(user);
    this.loginAtSignal.set(new Date());
    this.clickCountSignal.set(0);
    this.filterTextSignal.set('');
    this.historySignal.set([]);
    this.lastLogoutDurationSignal.set(null);
    this.nextHistoryId = 1;
  }

  endSession(): string {
    const startedAt = this.loginAtSignal();
    const endedAt = new Date();
    const duration = startedAt
      ? formatDuration(endedAt.getTime() - startedAt.getTime())
      : formatDuration(0);

    this.lastLogoutDurationSignal.set(duration);
    this.currentUserSignal.set(null);
    this.loginAtSignal.set(null);
    this.clickCountSignal.set(0);
    this.filterTextSignal.set('');
    this.historySignal.set([]);
    this.nextHistoryId = 1;

    return duration;
  }

  incrementClicks(): void {
    this.clickCountSignal.update((currentValue) => currentValue + 1);
  }

  setFilterText(value: string): void {
    this.filterTextSignal.set(value);
  }

  addHistoryEntry(fullName: string): number {
    const entryId = this.nextHistoryId;
    this.nextHistoryId += 1;

    this.historySignal.update((entries) => [
      ...entries,
      {
        id: entryId,
        fullName,
        startAt: new Date(),
        endAt: null,
      },
    ]);

    return entryId;
  }

  closeHistoryEntry(entryId: number): void {
    this.historySignal.update((entries) =>
      entries.map((entry) =>
        entry.id === entryId ? { ...entry, endAt: new Date() } : entry
      )
    );
  }
}
