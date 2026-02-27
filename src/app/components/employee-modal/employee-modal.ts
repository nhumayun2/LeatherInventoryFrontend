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
  @Output() save = new EventEmitter<any>();

  isEditMode = false;

  // Used for the skills input field
  currentSkill: string = '';

  employeeData = {
    id: 0,
    name: '',
    role: '',
    email: '',
    phone: '',
    skills: [] as string[],
    joinedDate: '',
    monthlySalary: 0,
  };

  ngOnInit() {
    if (this.employee) {
      this.isEditMode = true;

      // HTML5 date inputs strictly require the YYYY-MM-DD format
      let formattedDate = '';
      if (this.employee.joinedDate) {
        const d = new Date(this.employee.joinedDate);
        formattedDate = d.toISOString().split('T')[0];
      }

      this.employeeData = {
        id: this.employee.id,
        name: this.employee.name,
        role: this.employee.role || '',
        email: this.employee.email || '',
        phone: this.employee.phone || '',
        // Use spread operator to safely copy the array
        skills: this.employee.skills ? [...this.employee.skills] : [],
        joinedDate: formattedDate,
        monthlySalary: this.employee.monthlySalary || 0,
      };
    } else {
      // Default joined date to today
      this.employeeData.joinedDate = new Date().toISOString().split('T')[0];
    }
  }

  closeModal() {
    this.close.emit();
  }

  // --- Skills Array Logic ---
  addSkill(event: any) {
    event.preventDefault();
    const val = this.currentSkill.trim();
    if (val && !this.employeeData.skills.includes(val)) {
      this.employeeData.skills.push(val);
    }
    this.currentSkill = '';
  }

  removeSkill(index: number) {
    this.employeeData.skills.splice(index, 1);
  }

  saveEmployee() {
    // Both Name and Role are required by your C# model
    if (!this.employeeData.name.trim() || !this.employeeData.role.trim()) {
      alert('Name and Role are required fields!');
      return;
    }

    this.save.emit(this.employeeData);
  }
}
