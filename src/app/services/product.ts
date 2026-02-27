import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Product {
  private apiUrl = 'https://localhost:7201/api/products';
  private designsUrl = 'https://localhost:7201/api/ProductDesigns';

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

  createDesign(newDesignData: any, imageFiles?: File[]): Observable<any> {
    const formData = new FormData();

    if (newDesignData.productId) formData.append('productId', newDesignData.productId.toString());
    if (newDesignData.designName) formData.append('designName', newDesignData.designName);
    if (newDesignData.price !== undefined) formData.append('price', newDesignData.price.toString());
    if (newDesignData.sku) formData.append('sku', newDesignData.sku);

    if (newDesignData.clientId) formData.append('clientId', newDesignData.clientId.toString());
    if (newDesignData.status) formData.append('status', newDesignData.status);
    if (newDesignData.unit) formData.append('unit', newDesignData.unit);
    if (newDesignData.specifications)
      formData.append('specifications', newDesignData.specifications);

    if (newDesignData.features && Array.isArray(newDesignData.features)) {
      newDesignData.features.forEach((feature: string) => {
        formData.append('features', feature);
      });
    }

    if (newDesignData.tags && Array.isArray(newDesignData.tags)) {
      newDesignData.tags.forEach((tag: string) => {
        formData.append('tags', tag);
      });
    }

    if (imageFiles && imageFiles.length > 0) {
      imageFiles.forEach((file: File) => {
        formData.append('Images', file, file.name);
      });
    }

    return this.http.post<any>(this.designsUrl, formData);
  }

  updateProduct(id: number, productData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, productData);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  updateDesign(id: number, designData: any, imageFiles?: File[]): Observable<any> {
    const formData = new FormData();

    // The backend UpdateDesignDto requires the ID to be passed in the form data
    formData.append('Id', id.toString());

    if (designData.productId) formData.append('productId', designData.productId.toString());
    if (designData.designName) formData.append('designName', designData.designName);
    if (designData.price !== undefined) formData.append('price', designData.price.toString());
    if (designData.sku) formData.append('sku', designData.sku);

    if (designData.clientId) formData.append('clientId', designData.clientId.toString());
    if (designData.status) formData.append('status', designData.status);
    if (designData.unit) formData.append('unit', designData.unit);
    if (designData.specifications) formData.append('specifications', designData.specifications);

    if (designData.quantityReady !== undefined)
      formData.append('quantityReady', designData.quantityReady.toString());
    if (designData.quantityInProduction !== undefined)
      formData.append('quantityInProduction', designData.quantityInProduction.toString());
    if (designData.quantityDamaged !== undefined)
      formData.append('quantityDamaged', designData.quantityDamaged.toString());

    if (designData.features && Array.isArray(designData.features)) {
      designData.features.forEach((feature: string) => {
        formData.append('features', feature);
      });
    }

    if (designData.tags && Array.isArray(designData.tags)) {
      designData.tags.forEach((tag: string) => {
        formData.append('tags', tag);
      });
    }

    // Append any NEW images the user wants to add while editing
    if (imageFiles && imageFiles.length > 0) {
      imageFiles.forEach((file: File) => {
        formData.append('Images', file, file.name);
      });
    }

    return this.http.put<any>(`${this.designsUrl}/${id}`, formData);
  }

  deleteDesign(id: number): Observable<any> {
    return this.http.delete<any>(`${this.designsUrl}/${id}`);
  }
}
