import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AppStateService } from '../services/app-state.service';
import { DummyJsonUser } from '../models/app.models';
import { UserApiService } from '../services/user-api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly userApi = inject(UserApiService);
  readonly appState = inject(AppStateService);

  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly submitError = signal<string | null>(null);
  readonly users = signal<DummyJsonUser[]>([]);

  readonly form = this.formBuilder.nonNullable.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.userApi.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set('Nepodarilo sa načítať zoznam používateľov z DummyJSON.');
        this.loading.set(false);
      },
    });
  }

  submit(): void {
    this.submitError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const submittedFirstName = this.normalize(this.form.controls.firstName.value);
    const submittedLastName = this.normalize(this.form.controls.lastName.value);
    const matchedUser = this.users().find(
      (user) =>
        this.normalize(user.firstName) === submittedFirstName &&
        this.normalize(user.lastName) === submittedLastName
    );

    if (!matchedUser) {
      this.submitError.set('Zadané meno a priezvisko sa nenašli medzi používateľmi.');
      return;
    }

    this.appState.startSession({
      id: matchedUser.id,
      firstName: matchedUser.firstName,
      lastName: matchedUser.lastName,
    });

    this.router.navigateByUrl('/app');
  }

  private normalize(value: string): string {
    return value.trim().toLowerCase();
  }
}
