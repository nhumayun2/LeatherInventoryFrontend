import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Employee {
  private apiUrl = `${environment.apiUrl}/Employees`;

  constructor(private http: HttpClient) {}

  getEmployees(searchQuery?: string): Observable<any[]> {
    let params = new HttpParams();

    // search term is provided, append it to the URL
    if (searchQuery) {
      params = params.set('search', searchQuery);
    }

    return this.http.get<any[]>(this.apiUrl, { params });
  }

  getEmployee(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createEmployee(employeeData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, employeeData);
  }

  updateEmployee(id: number, employeeData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, employeeData);
  }

  deleteEmployee(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
