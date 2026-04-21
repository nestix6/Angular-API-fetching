import { Component, HostListener, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { forkJoin, Subscription } from 'rxjs';
import { AppStateService } from '../services/app-state.service';
import {
  AuthenticatedUser,
  DetailHistoryEntry,
  DummyJsonUser,
  EnrichedUserDetail,
} from '../models/app.models';
import { UserApiService } from '../services/user-api.service';
import {
  formatClockTime,
  formatDateTime,
  normalizeText,
} from '../utils/time-utils';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-browser',
  standalone: true,
  templateUrl: './user-browser.component.html',
  styleUrls: ['./user-browser.component.css'],
})
export class UserBrowserComponent implements OnInit, OnDestroy {
  private readonly userApi = inject(UserApiService);
  private readonly appState = inject(AppStateService);
  private readonly router = inject(Router);
  private detailSubscription: Subscription | null = null;

  readonly users = signal<DummyJsonUser[]>([]);
  readonly loadingUsers = signal(true);
  readonly userLoadError = signal<string | null>(null);
  readonly selectedCardUserId = signal<number | null>(null);
  readonly activeDetail = signal<EnrichedUserDetail | null>(null);
  readonly detailLoading = signal(false);
  readonly detailError = signal<string | null>(null);
  readonly activeHistoryEntryId = signal<number | null>(null);

  readonly currentUser = this.appState.currentUser;
  readonly loginAt = this.appState.loginAt;
  readonly clickCount = this.appState.clickCount;
  readonly filterText = this.appState.filterText;
  readonly history = this.appState.history;

  readonly filteredUsers = computed(() => {
    const currentUserId = this.currentUser()?.id ?? null;
    const filter = normalizeText(this.filterText());

    return this.users().filter((user) => {
      if (user.id === currentUserId) {
        return false;
      }

      if (!filter) {
        return true;
      }

      return normalizeText(user.lastName).includes(filter);
    });
  });

  ngOnInit(): void {
    this.userApi.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loadingUsers.set(false);
      },
      error: () => {
        this.userLoadError.set('Nepodarilo sa načítať používateľov.');
        this.loadingUsers.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    this.detailSubscription?.unsubscribe();
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.appState.incrementClicks();
  }

  onFilterInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.appState.setFilterText(value);
  }

  selectCard(user: DummyJsonUser): void {
    if (this.selectedCardUserId() === user.id) {
      if (this.activeDetail()?.user.id === user.id) {
        this.closeDetail();
      }

      this.selectedCardUserId.set(null);
      return;
    }

    this.selectedCardUserId.set(user.id);
  }

  openDetail(user: DummyJsonUser, event?: MouseEvent): void {
    event?.stopPropagation();

    if (this.detailLoading()) {
      return;
    }

    this.appState.incrementClicks();
    this.selectedCardUserId.set(user.id);
    this.detailError.set(null);
    this.detailLoading.set(true);

    if (this.activeHistoryEntryId() !== null) {
      this.appState.closeHistoryEntry(this.activeHistoryEntryId() as number);
      this.activeHistoryEntryId.set(null);
    }

    this.detailSubscription?.unsubscribe();
    const historyEntryId = this.appState.addHistoryEntry(
      `${user.firstName} ${user.lastName}`
    );
    this.activeHistoryEntryId.set(historyEntryId);
    this.activeDetail.set({
      user,
      gender: 'Načítava sa...',
      homeState: 'Načítava sa...',
      homeCountry: 'Načítava sa...',
    });

    this.detailSubscription = forkJoin({
      gender: this.userApi.getGenderByName(user.firstName),
      location: this.userApi.getLocationByPostalCode(user.address?.postalCode),
    }).subscribe({
      next: ({ gender, location }) => {
        this.activeDetail.set({
          user,
          gender: gender?.gender ?? 'Neznáme',
          homeState: location?.places[0]?.state ?? user.address?.state ?? 'Neznáme',
          homeCountry: location?.country ?? user.address?.country ?? 'Neznáme',
        });
        this.detailLoading.set(false);
      },
      error: () => {
        this.activeDetail.set({
          user,
          gender: 'Neznáme',
          homeState: user.address?.state ?? 'Neznáme',
          homeCountry: user.address?.country ?? 'Neznáme',
        });
        this.detailError.set('Detail sa nepodarilo úplne doplniť z externých služieb.');
        this.detailLoading.set(false);
      },
    });
  }

  closeDetail(): void {
    if (this.activeHistoryEntryId() !== null) {
      this.appState.closeHistoryEntry(this.activeHistoryEntryId() as number);
      this.activeHistoryEntryId.set(null);
    }

    this.detailSubscription?.unsubscribe();
    this.activeDetail.set(null);
    this.detailLoading.set(false);
    this.detailError.set(null);
  }

  logout(): void {
    if (this.activeHistoryEntryId() !== null) {
      this.appState.closeHistoryEntry(this.activeHistoryEntryId() as number);
      this.activeHistoryEntryId.set(null);
    }

    this.detailSubscription?.unsubscribe();
    this.detailSubscription = null;
    this.appState.endSession();
    this.router.navigateByUrl('/login');
  }

  formatLoginAt(): string {
    return formatDateTime(this.loginAt());
  }

  formatHistoryTime(date: Date | null): string {
    return formatClockTime(date);
  }

  fullName(user: AuthenticatedUser | DummyJsonUser | null): string {
    if (!user) {
      return '—';
    }

    return `${user.firstName} ${user.lastName}`;
  }

  trackHistoryEntry(_: number, entry: DetailHistoryEntry): number {
    return entry.id;
  }
}
