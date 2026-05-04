import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Product {
  private apiUrl = `${environment.apiUrl}/Products`;
  private designsUrl = `${environment.apiUrl}/ProductDesigns`;

  constructor(private http: HttpClient) {}

  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getProductDesigns(productId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.designsUrl}/ByProduct/${productId}`);
  }

  getDesignById(designId: number): Observable<any> {
    return this.http.get<any>(`${this.designsUrl}/${designId}`);
  }

  createProduct(newProductData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, newProductData);
  }

  // 🌟 NEW: Added costingLink parameter
  createDesign(newDesignData: any, imageFiles?: File[], costingFile?: File, costingLink?: string): Observable<any> {
    const formData = new FormData();

    if (newDesignData.productId) formData.append('productId', newDesignData.productId.toString());
    if (newDesignData.designName) formData.append('designName', newDesignData.designName);
    if (newDesignData.price !== undefined) formData.append('price', newDesignData.price.toString());
    if (newDesignData.clientId) formData.append('clientId', newDesignData.clientId.toString());
    if (newDesignData.status) formData.append('status', newDesignData.status);
    if (newDesignData.specifications)
      formData.append('specifications', newDesignData.specifications);
    if (newDesignData.stock !== undefined) formData.append('stock', newDesignData.stock.toString());

    if (newDesignData.karigarArticleNumber)
      formData.append('KarigarArticleNumber', newDesignData.karigarArticleNumber);

    if (newDesignData.clientArticleNumbers && Array.isArray(newDesignData.clientArticleNumbers)) {
      newDesignData.clientArticleNumbers.forEach((num: string) => {
        formData.append('ClientArticleNumbers', num);
      });
    }

    if (newDesignData.features && Array.isArray(newDesignData.features)) {
      newDesignData.features.forEach((feature: string) => {
        formData.append('Features', feature);
      });
    }

    if (newDesignData.tags && Array.isArray(newDesignData.tags)) {
      newDesignData.tags.forEach((tag: string) => {
        formData.append('Tags', tag);
      });
    }

    if (imageFiles && imageFiles.length > 0) {
      imageFiles.forEach((file: File) => {
        formData.append('Images', file, file.name);
      });
    }

    if (costingFile) {
      formData.append('CostingFile', costingFile, costingFile.name);
    }

    // 🌟 NEW: Append the cloud link if the user pasted one
    if (costingLink) {
      formData.append('CostingLink', costingLink);
    }

    return this.http.post<any>(this.designsUrl, formData);
  }

  updateProduct(id: number, productData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, productData);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // 🌟 NEW: Added costingLink parameter
  updateDesign(
    id: number,
    designData: any,
    imageFiles?: File[],
    costingFile?: File,
    costingLink?: string
  ): Observable<any> {
    const formData = new FormData();

    formData.append('Id', id.toString());

    if (designData.productId) formData.append('productId', designData.productId.toString());
    if (designData.designName) formData.append('designName', designData.designName);
    if (designData.price !== undefined) formData.append('price', designData.price.toString());
    if (designData.clientId) formData.append('clientId', designData.clientId.toString());
    if (designData.status) formData.append('status', designData.status);
    if (designData.specifications) formData.append('specifications', designData.specifications);
    if (designData.stock !== undefined) formData.append('stock', designData.stock.toString());

    if (designData.karigarArticleNumber)
      formData.append('KarigarArticleNumber', designData.karigarArticleNumber);

    if (designData.clientArticleNumbers && Array.isArray(designData.clientArticleNumbers)) {
      designData.clientArticleNumbers.forEach((num: string) => {
        formData.append('ClientArticleNumbers', num);
      });
    }

    if (designData.features && Array.isArray(designData.features)) {
      designData.features.forEach((feature: string) => {
        formData.append('Features', feature);
      });
    }

    if (designData.tags && Array.isArray(designData.tags)) {
      designData.tags.forEach((tag: string) => {
        formData.append('Tags', tag);
      });
    }

    if (imageFiles && imageFiles.length > 0) {
      imageFiles.forEach((file: File) => {
        formData.append('Images', file, file.name);
      });
    }

    if (costingFile) {
      formData.append('CostingFile', costingFile, costingFile.name);
    }

    // 🌟 NEW: Append the cloud link if the user pasted one
    if (costingLink) {
      formData.append('CostingLink', costingLink);
    }

    return this.http.put<any>(`${this.designsUrl}/${id}`, formData);
  }

  deleteDesign(id: number): Observable<any> {
    return this.http.delete<any>(`${this.designsUrl}/${id}`);
  }
}