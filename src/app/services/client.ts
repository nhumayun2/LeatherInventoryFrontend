import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Client {
  private apiUrl = `${environment.apiUrl}/Clients`;

  constructor(private http: HttpClient) {}

  getClients(searchQuery?: string): Observable<any[]> {
    let params = new HttpParams();

    if (searchQuery) {
      params = params.set('search', searchQuery);
    }

    return this.http.get<any[]>(this.apiUrl, { params });
  }

  getClient(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createClient(clientFormData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, clientFormData);
  }

  updateClient(id: number, clientFormData: FormData): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, clientFormData);
  }

  deleteClient(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
