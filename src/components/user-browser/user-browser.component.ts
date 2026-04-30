import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from "@angular/core";
import { forkJoin, Subscription } from "rxjs";
import { AppStateService } from "../services/app-state.service";
import {
  AuthenticatedUser,
  DetailHistoryEntry,
  DummyJsonUser,
  EnrichedUserDetail,
} from "../models/app.models";
import { UserApiService } from "../services/user-api.service";
import {
  formatClockTime,
  formatDateTime,
  normalizeText,
} from "../utils/time-utils";
import { Router } from "@angular/router";

const USER_BROWSER_MESSAGES = {
  usersLoadFailed: "Nepodarilo sa načítať používateľov.",
  loading: "Načítava sa...",
  unknown: "Neznáme",
  partialDetailLoadFailed:
    "Detail sa nepodarilo úplne doplniť z externých služieb.",
} as const;

@Component({
  selector: "app-user-browser",
  standalone: true,
  templateUrl: "./user-browser.component.html",
  styleUrls: ["./user-browser.component.css"],
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

  /** Loads all users used by the list and detail panels. */
  ngOnInit(): void {
    this.userApi.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loadingUsers.set(false);
      },
      error: () => {
        this.userLoadError.set(USER_BROWSER_MESSAGES.usersLoadFailed);
        this.loadingUsers.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    this.detailSubscription?.unsubscribe();
  }

  @HostListener("document:click")
  onDocumentClick(): void {
    this.appState.incrementClicks();
  }

  onFilterInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.appState.setFilterText(value);
  }

  /** Selects a user card; clicking an already selected card toggles it off. */
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

  /** Opens detail and enriches it with gender and location data from external APIs. */
  openDetail(user: DummyJsonUser, event?: MouseEvent): void {
    event?.stopPropagation();

    if (this.detailLoading()) {
      return;
    }

    this.appState.incrementClicks();
    this.selectedCardUserId.set(null);
    this.detailError.set(null);
    this.detailLoading.set(true);

    this.closeActiveHistoryEntry();

    this.detailSubscription?.unsubscribe();
    const historyEntryId = this.appState.addHistoryEntry(
      `${user.firstName} ${user.lastName}`,
    );
    this.activeHistoryEntryId.set(historyEntryId);
    this.activeDetail.set({
      user,
      gender: USER_BROWSER_MESSAGES.loading,
      homeState: USER_BROWSER_MESSAGES.loading,
      homeCountry: USER_BROWSER_MESSAGES.loading,
    });

    this.detailSubscription = forkJoin({
      gender: this.userApi.getGenderByName(user.firstName),
      location: this.userApi.getLocationByPostalCode(user.address?.postalCode),
    }).subscribe({
      next: ({ gender, location }) => {
        this.activeDetail.set({
          user,
          gender: gender?.gender ?? USER_BROWSER_MESSAGES.unknown,
          homeState:
            location?.places[0]?.state ??
            user.address?.state ??
            USER_BROWSER_MESSAGES.unknown,
          homeCountry:
            location?.country ??
            user.address?.country ??
            USER_BROWSER_MESSAGES.unknown,
        });
        this.detailLoading.set(false);
      },
      error: () => {
        this.activeDetail.set({
          user,
          gender: USER_BROWSER_MESSAGES.unknown,
          homeState: user.address?.state ?? USER_BROWSER_MESSAGES.unknown,
          homeCountry: user.address?.country ?? USER_BROWSER_MESSAGES.unknown,
        });
        this.detailError.set(USER_BROWSER_MESSAGES.partialDetailLoadFailed);
        this.detailLoading.set(false);
      },
    });
  }

  /** Closes currently shown detail panel and clears associated transient state. */
  closeDetail(): void {
    this.closeActiveHistoryEntry();

    this.detailSubscription?.unsubscribe();
    this.activeDetail.set(null);
    this.detailLoading.set(false);
    this.detailError.set(null);
  }

  /** Ends session and redirects to login. */
  logout(): void {
    this.closeActiveHistoryEntry();

    this.detailSubscription?.unsubscribe();
    this.detailSubscription = null;
    this.appState.endSession();
    this.router.navigateByUrl("/login");
  }

  formatLoginAt(): string {
    return formatDateTime(this.loginAt());
  }

  formatHistoryTime(date: Date | null): string {
    return formatClockTime(date);
  }

  fullName(user: AuthenticatedUser | DummyJsonUser | null): string {
    if (!user) {
      return "—";
    }

    return `${user.firstName} ${user.lastName}`;
  }

  trackHistoryEntry(_: number, entry: DetailHistoryEntry): number {
    return entry.id;
  }

  /** Closes active history entry when a detail view is replaced or dismissed. */
  private closeActiveHistoryEntry(): void {
    const activeHistoryEntryId = this.activeHistoryEntryId();
    if (activeHistoryEntryId === null) {
      return;
    }

    this.appState.closeHistoryEntry(activeHistoryEntryId);
    this.activeHistoryEntryId.set(null);
  }
}
