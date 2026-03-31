import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-employee-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-modal.html',
  styleUrl: './employee-modal.css',
})
export class EmployeeModal implements OnInit {
  @Input() employee: any = null;

  @Output() close = new EventEmitter<void>();

  // 🌟 CHANGED: Now emits FormData so we can upload the Employee Image!
  @Output() save = new EventEmitter<FormData>();

  isEditMode = false;
  isSaving = false;

  // 🌟 UPDATED: Your new data model
  employeeData = {
    id: 0,
    name: '',
    address: '',
    role: '',
    section: '',
    phone: '',
    salary: 0,
    overtimeSalary: 0,
    joinedDate: '',
  };

  // 🌟 NEW: Image Upload State
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  ngOnInit() {
    if (this.employee) {
      this.isEditMode = true;

      let formattedDate = '';
      if (this.employee.joinedDate || this.employee.date) {
        const d = new Date(this.employee.joinedDate || this.employee.date);
        formattedDate = d.toISOString().split('T')[0];
      }

      this.employeeData = {
        id: this.employee.id,
        name: this.employee.name || '',
        address: this.employee.address || '',
        role: this.employee.role || '',
        section: this.employee.section || '',
        phone: this.employee.phone || '',
        salary: this.employee.salary || 0,
        overtimeSalary: this.employee.overtimeSalary || 0,
        joinedDate: formattedDate,
      };

      // 🌟 NEW: Load existing image if they have one
      if (this.employee.imageUrl) {
        this.imagePreview = this.employee.imageUrl;
      }
    } else {
      this.employeeData.joinedDate = new Date().toISOString().split('T')[0];
    }
  }

  closeModal() {
    this.close.emit();
  }

  // --- Image Upload Logic ---
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.selectedFile = null;
    this.imagePreview = null;
  }

  saveEmployee() {
    if (!this.employeeData.name.trim() || !this.employeeData.role.trim()) {
      alert('Name and Role are required fields!');
      return;
    }

    if (this.isSaving) return;
    this.isSaving = true;

    // 🌟 NEW: Package everything up as FormData for the backend
    const formData = new FormData();

    if (this.isEditMode) {
      formData.append('Id', this.employeeData.id.toString());
    }

    // Append all text/number fields
    formData.append('Name', this.employeeData.name);
    formData.append('Address', this.employeeData.address);
    formData.append('Role', this.employeeData.role);
    formData.append('Section', this.employeeData.section);
    formData.append('Phone', this.employeeData.phone);
    formData.append('Salary', this.employeeData.salary.toString());
    formData.append('OvertimeSalary', this.employeeData.overtimeSalary.toString());
    formData.append('JoinedDate', this.employeeData.joinedDate);

    // Append the image file if selected
    if (this.selectedFile) {
      formData.append('Image', this.selectedFile);
    }

    this.save.emit(formData);
  }
}
