import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ExcelEditorModal } from '../../components/excel-editor-modal/excel-editor-modal';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-client-finance',
  standalone: true,
  imports: [CommonModule, ExcelEditorModal, FormsModule],
  templateUrl: './client-finance.html',
  styleUrl: './client-finance.css',
})
export class ClientFinance implements OnInit {
  isEditorOpen = false;
  selectedDocToEdit: any = null;
  clientId: number = 0;
  documents: any[] = [];

  isLoading = true;
  isUploading = false;
  searchQuery: string = '';
  sortOption: string = 'newest';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
  ) {}

  ngOnInit() {
    // Grab the ID from the URL (e.g., /finance/12 -> 12)
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
    this.http.get<any[]>(`${environment.apiUrl}/Finance/Client/${this.clientId}`).subscribe({
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

  // --- Upload Logic ---
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.uploadFile(file);
    }
    // Reset the input so the same file can be selected again if needed
    event.target.value = '';
  }

  uploadFile(file: File) {
    // Safety check: Only allow Excel files
    if (!file.name.endsWith('.xlsx')) {
      alert('Only .xlsx Excel files are allowed.');
      return;
    }

    this.isUploading = true;

    // We must use FormData because we are sending an actual file, not just JSON text
    const formData = new FormData();
    formData.append('ClientId', this.clientId.toString());
    formData.append('Document', file);

    this.http.post(`${environment.apiUrl}/Finance/Upload`, formData).subscribe({
      next: () => {
        this.isUploading = false;
        this.loadDocuments(); // Refresh the list
      },
      error: (err) => {
        console.error('Upload failed', err);
        alert('Failed to upload document. Please try again.');
        this.isUploading = false;
      },
    });
  }

  deleteDocument(id: number, event: Event) {
    event.stopPropagation(); // Prevent the row click from triggering the preview

    if (confirm('Are you sure you want to permanently delete this spreadsheet?')) {
      this.http.delete(`${environment.apiUrl}/Finance/${id}`).subscribe({
        next: () => {
          this.loadDocuments(); // Refresh the list
        },
        error: (err) => console.error('Delete failed', err),
      });
    }
  }

  // 🌟 Dynamic Filter & Sort Engine
  get processedDocuments() {
    let result = this.documents;

    // 1. Search Filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter((doc) => doc.fileName.toLowerCase().includes(query));
    }

    // 2. Sort Logic
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

  // We will build the actual preview logic in Phase 4!
  openPreview(doc: any) {
    this.selectedDocToEdit = doc;
    this.isEditorOpen = true;
  }

  closeEditor() {
    this.isEditorOpen = false;
    this.selectedDocToEdit = null;
  }

  onEditorSaved() {
    this.closeEditor();
    this.loadDocuments();
  }

  goBack() {
    this.router.navigate(['/finance']);
  }
}
