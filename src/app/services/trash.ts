import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Trash {
  private apiUrl = `${environment.apiUrl}/Trash`;

  constructor(private http: HttpClient) {}

  // 1. Fetch all deleted items across the whole factory
  getTrash(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // 2. Restore an array of selected items
  restoreItems(items: { id: number; type: string }[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/restore`, items);
  }

  // 3. Permanently delete an array of selected items
  permanentlyDeleteItems(items: { id: number; type: string }[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/delete-permanently`, items);
  }
}
