import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, map, Observable, of, shareReplay, switchMap } from 'rxjs';
import {
  DummyJsonUser,
  DummyJsonUsersResponse,
  GenderizeResponse,
  ZippopotamResponse,
} from '../models/app.models';

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private readonly http = inject(HttpClient);
  private readonly usersEndpoint = 'https://dummyjson.com/users';
  private readonly genderEndpoint = 'https://api.genderize.io';
  private readonly zipEndpoint = 'https://api.zippopotam.us';
  private readonly usersResponse$ = this.http
    .get<DummyJsonUsersResponse>(this.usersEndpoint, {
      params: { limit: 1, skip: 0 },
    })
    .pipe(
      switchMap((response) =>
        this.http.get<DummyJsonUsersResponse>(this.usersEndpoint, {
          params: { limit: response.total, skip: 0 },
        })
      ),
      shareReplay(1)
    );

  getUsers(): Observable<DummyJsonUser[]> {
    return this.usersResponse$.pipe(map((response) => response.users));
  }

  getGenderByName(firstName: string): Observable<GenderizeResponse | null> {
    return this.http
      .get<GenderizeResponse>(this.genderEndpoint, {
        params: { name: firstName },
      })
      .pipe(catchError(() => of(null)));
  }

  getLocationByPostalCode(
    postalCode: string | undefined
  ): Observable<ZippopotamResponse | null> {
    if (!postalCode) {
      return of(null);
    }

    return this.http
      .get<ZippopotamResponse>(`${this.zipEndpoint}/us/${encodeURIComponent(postalCode)}`)
      .pipe(catchError(() => of(null)));
  }
}
