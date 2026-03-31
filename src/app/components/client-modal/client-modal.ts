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
  @Output() save = new EventEmitter<FormData>();

  isEditMode = false;

  // The Loading State Flag
  isSaving = false;

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
  }

  saveClient() {
    if (!this.clientData.name.trim()) {
      alert('Client Name is required!');
      return;
    }

    //  Prevent multiple clicks by stopping the function if already saving
    if (this.isSaving) return;

    // Turn on the loading state!
    this.isSaving = true;

    // Building the FormData exactly how your C# [FromForm] attributes expect it
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

    // Send it up to clients.ts to be passed to C# controller.
    // Note: The modal will automatically be destroyed by the parent
    // component (Clients page) once the backend returns success, so we
    // don't need to manually set isSaving back to false!
    this.save.emit(formData);
  }
}
