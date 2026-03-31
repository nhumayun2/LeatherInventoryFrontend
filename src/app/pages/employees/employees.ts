import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Employee } from '../../services/employee';
import { EmployeeModal } from '../../components/employee-modal/employee-modal';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule, EmployeeModal],
  templateUrl: './employees.html',
  styleUrl: './employees.css',
})
export class Employees implements OnInit {
  @ViewChild(EmployeeModal) employeeModalComponent!: EmployeeModal;

  // Master list from the database
  employees: any[] = [];

  // The list currently shown on screen (after searching/filtering)
  filteredEmployees: any[] = [];

  // UI State for Filters
  searchQuery: string = '';
  selectedRole: string = 'All';
  roles: string[] = ['All'];

  // UI State for Edit/Create Modal
  isModalOpen = false;
  selectedEmployeeToEdit: any = null;

  // 🌟 NEW: UI State for the Read-Only View Profile Modal
  isViewModalOpen = false;
  selectedEmployeeToView: any = null;

  constructor(private employeeService: Employee) {}

  ngOnInit() {
    this.loadEmployees();
  }

  loadEmployees() {
    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        this.extractRoles();
        this.applyFilters();
      },
      error: (err) => console.error('Failed to load employees', err),
    });
  }

  getInitials(name: string): string {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  extractRoles() {
    const allRoles = this.employees.map((e) => e.role).filter((r) => r);
    this.roles = ['All', ...new Set(allRoles)];
  }

  applyFilters() {
    this.filteredEmployees = this.employees.filter((emp) => {
      const searchStr = this.searchQuery.toLowerCase();
      const matchesSearch =
        (emp.name && emp.name.toLowerCase().includes(searchStr)) ||
        (emp.role && emp.role.toLowerCase().includes(searchStr)) ||
        (emp.email && emp.email.toLowerCase().includes(searchStr)) ||
        (emp.phone && emp.phone.toLowerCase().includes(searchStr));

      const matchesRole = this.selectedRole === 'All' || emp.role === this.selectedRole;

      return matchesSearch && matchesRole;
    });
  }

  // --- Modal Controls ---

  openModal(employee?: any) {
    this.selectedEmployeeToEdit = employee || null;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedEmployeeToEdit = null;
  }

  // 🌟 NEW: View Profile Modal Controls
  openViewModal(employee: any) {
    this.selectedEmployeeToView = employee;
    this.isViewModalOpen = true;
  }

  closeViewModal() {
    this.isViewModalOpen = false;
    this.selectedEmployeeToView = null;
  }

  // --- Data Operations ---

  handleSave(formData: FormData) {
    const idString = formData.get('Id');
    const id = idString ? parseInt(idString as string, 10) : 0;

    if (id && id > 0) {
      // UPDATE EXISTING
      this.employeeService.updateEmployee(id, formData).subscribe({
        next: () => {
          this.loadEmployees();
          this.closeModal();
        },
        error: (err) => {
          console.error('Failed to update employee', err);
          alert('Failed to update employee profile.');
          if (this.employeeModalComponent) {
            this.employeeModalComponent.isSaving = false;
          }
        },
      });
    } else {
      // CREATE NEW
      this.employeeService.createEmployee(formData).subscribe({
        next: () => {
          this.loadEmployees();
          this.closeModal();
        },
        error: (err) => {
          console.error('Failed to create employee', err);
          alert('Failed to create new employee.');
          if (this.employeeModalComponent) {
            this.employeeModalComponent.isSaving = false;
          }
        },
      });
    }
  }

  deleteEmployee(id: number) {
    if (confirm('Are you sure you want to remove this employee from the directory?')) {
      this.employeeService.deleteEmployee(id).subscribe({
        next: () => {
          this.loadEmployees();
        },
        error: (err) => console.error('Failed to delete employee', err),
      });
    }
  }
}
