import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Client {
  private apiUrl = 'https://localhost:7201/api/clients';
  
  constructor(private http: HttpClient) {}

  getClients(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createClient(name: string, logoFile?: File): Observable<any> {
    const formData = new FormData();
    formData.append('name', name);

    if (logoFile) {
      formData.append('logo', logoFile, logoFile.name);
    }

    return this.http.post<any>(this.apiUrl, formData);
  }
}
