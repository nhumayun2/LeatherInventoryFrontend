import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Order {
  private apiUrl = `${environment.apiUrl}/Orders`;

  constructor(private http: HttpClient) {}

  getOrders(searchQuery?: string, productType?: string, status?: string): Observable<any[]> {
    let params = new HttpParams();

    if (searchQuery) {
      params = params.set('search', searchQuery);
    }
    if (productType) {
      params = params.set('productType', productType);
    }
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<any[]>(this.apiUrl, { params });
  }

  getOrder(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createOrder(orderData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, orderData);
  }

  updateOrder(id: number, orderData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, orderData);
  }

  deleteOrder(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
