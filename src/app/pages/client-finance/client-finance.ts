import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Finance } from '../../services/finance';
// 🌟 NEW: Import the viewer component
import { OnedriveViewer } from '../../components/onedrive-viewer/onedrive-viewer';

@Component({
  selector: 'app-client-finance',
  standalone: true,
  // 🌟 NEW: Add OnedriveViewer to imports
  imports: [CommonModule, FormsModule, OnedriveViewer],
  templateUrl: './client-finance.html',
  styleUrl: './client-finance.css',
})
export class ClientFinance implements OnInit {
  clientId: number = 0;
  documents: any[] = [];

  isLoading = true;
  isUploading = false;
  searchQuery: string = '';
  sortOption: string = 'newest';

  isPreviewOpen = false;
  currentDoc: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private financeService: Finance
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.clientId = parseInt(idParam, 10);
        this.loadDocuments();
      } else {
        this.goBack();
      }
    });
  }

  loadDocuments() {
    this.isLoading = true;
    this.financeService.getClientDocuments(this.clientId).subscribe({
      next: (data) => {
        this.documents = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load documents', err);
        this.isLoading = false;
      },
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.uploadFile(file);
    }
    event.target.value = '';
  }

  uploadFile(file: File) {
    if (!file.name.endsWith('.xlsx')) {
      alert('Only .xlsx Excel files are allowed.');
      return;
    }

    this.isUploading = true;

    const formData = new FormData();
    formData.append('ClientId', this.clientId.toString());
    formData.append('Document', file);

    this.financeService.uploadDocument(formData).subscribe({
      next: () => {
        this.isUploading = false;
        this.loadDocuments(); 
      },
      error: (err) => {
        console.error('Upload failed', err);
        alert('Failed to upload document. Please try again.');
        this.isUploading = false;
      },
    });
  }

  deleteDocument(id: number, event: Event) {
    event.stopPropagation(); 

    if (confirm('Are you sure you want to permanently delete this spreadsheet from the cloud?')) {
      this.financeService.deleteDocument(id).subscribe({
        next: () => {
          this.loadDocuments(); 
        },
        error: (err) => console.error('Delete failed', err),
      });
    }
  }

  get processedDocuments() {
    let result = this.documents;

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter((doc) => doc.fileName.toLowerCase().includes(query));
    }

    return result.sort((a, b) => {
      if (this.sortOption === 'newest') {
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      } else if (this.sortOption === 'oldest') {
        return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
      } else if (this.sortOption === 'nameAsc') {
        return a.fileName.localeCompare(b.fileName);
      } else if (this.sortOption === 'nameDesc') {
        return b.fileName.localeCompare(a.fileName);
      }
      return 0;
    });
  }

  // 🌟 FIX: Simplified because the component handles the heavy lifting now
  openPreview(doc: any) {
    this.currentDoc = doc;
    this.isPreviewOpen = true;
  }

  closePreview() {
    this.isPreviewOpen = false;
    this.currentDoc = null;
  }

  goBack() {
    this.router.navigate(['/finance']);
  }
}