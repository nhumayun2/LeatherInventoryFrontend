import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/Auth`;

  constructor(private http: HttpClient) {}

  // 1. Authenticate user credentials and preserve session token
  login(loginData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, loginData).pipe(
      tap((response) => {
        if (response && response.token) {
          localStorage.setItem('karigar_token', response.token);
          localStorage.setItem('karigar_user', response.username);
        }
      })
    );
  }

  // 2. Dispatch request to email a 6-digit verification code
  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/forgot-password`, { email });
  }

  // 3. Verify code and commit the new password override
  resetPassword(resetData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reset-password`, resetData);
  }

  // 4. Purge local storage and force session termination
  logout() {
    localStorage.removeItem('karigar_token');
    localStorage.removeItem('karigar_user');
  }

  // 5. Read current active session token
  getToken(): string | null {
    return localStorage.getItem('karigar_token');
  }

  // 6. Basic check to see if token exists
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}