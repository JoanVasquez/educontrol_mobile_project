import { Injectable } from '@angular/core';

const REMEMBERED_USER_KEY = 'educontrol.rememberedUser';

@Injectable({ providedIn: 'root' })
export class RememberedUserService {
  get(): string {
    return localStorage.getItem(REMEMBERED_USER_KEY) ?? '';
  }

  save(user: string): void {
    localStorage.setItem(REMEMBERED_USER_KEY, user);
  }

  clear(): void {
    localStorage.removeItem(REMEMBERED_USER_KEY);
  }
}
