import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-client-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-modal.html',
  styleUrl: './client-modal.css',
})
export class ClientModal implements OnInit {
  @Input() client: any = null;

  @Output() close = new EventEmitter<void>();
  // 🌟 Notice we are specifically emitting FormData here, not a standard JSON object!
  @Output() save = new EventEmitter<FormData>();

  isEditMode = false;

  clientData = {
    id: 0,
    name: '',
  };

  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  ngOnInit() {
    if (this.client) {
      this.isEditMode = true;
      this.clientData = {
        id: this.client.id,
        name: this.client.name,
      };

      // If the client already has a logo from Cloudinary, show it in the preview box
      if (this.client.logoUrl) {
        this.imagePreview = this.client.logoUrl;
      }
    }
  }

  closeModal() {
    this.close.emit();
  }

  // Handles the user selecting an image from their computer
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      // Create a local preview to show the user instantly before it uploads
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Lets the user clear the selected image if they made a mistake
  removeImage() {
    this.selectedFile = null;
    this.imagePreview = null;
    // Note: If they are editing and remove the image, we would handle keeping/removing
    // the existing Cloudinary URL on the backend, but for the UI, we just clear the preview.
  }

  saveClient() {
    if (!this.clientData.name.trim()) {
      alert('Client Name is required!');
      return;
    }

    // 🌟 Building the FormData exactly how your C# [FromForm] attributes expect it
    const formData = new FormData();

    // Always append the Name
    formData.append('name', this.clientData.name);

    // If we are editing, we need to pass the ID back so the update method knows who to update
    if (this.isEditMode) {
      formData.append('Id', this.clientData.id.toString());
    }

    // Append the actual physical file if they selected one
    if (this.selectedFile) {
      formData.append('logo', this.selectedFile);
    }

    // Send it up to clients.ts to be passed to your C# controller
    this.save.emit(formData);
  }
}
