import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Finance {
  private apiUrl = `${environment.apiUrl}/Finance`;

  constructor(private http: HttpClient) {}

  // 1. Fetch all clients (Regular + Finance-Only)
  getAllFinanceClients(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Clients`);
  }

  // 2. Create a Finance-Only Sub-Brand
  createSubBrand(subBrandData: { name: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/SubBrand`, subBrandData);
  }

  // 3. Delete a Finance-Only Sub-Brand
  deleteSubBrand(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/SubBrand/${id}`);
  }

  // 4. Get documents for a specific client
  getClientDocuments(clientId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Client/${clientId}`);
  }

  // 5. Upload Excel to OneDrive
  uploadDocument(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Upload`, formData);
  }

  // 6. Delete document from OneDrive & Database
  deleteDocument(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}