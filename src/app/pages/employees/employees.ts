import { Component, OnInit } from '@angular/core';
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
  // Master list from the database
  employees: any[] = [];

  // The list currently shown on screen (after searching/filtering)
  filteredEmployees: any[] = [];

  // UI State for Filters
  searchQuery: string = '';
  selectedRole: string = 'All'; // Changed from Department to Role
  roles: string[] = ['All']; // Auto-populates based on database data

  // UI State for Modal
  isModalOpen = false;
  selectedEmployeeToEdit: any = null;

  constructor(private employeeService: Employee) {}

  ngOnInit() {
    this.loadEmployees();
  }

  loadEmployees() {
    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        console.log('Loaded Employees:', data);
        this.employees = data;

        // Extract unique roles for the dropdown
        this.extractRoles();

        // Apply initial filters to populate the table
        this.applyFilters();
      },
      error: (err) => console.error('Failed to load employees', err),
    });
  }

  // Helper to extract "AH" from "Ahmed Hassan" for the cool UI avatars
  getInitials(name: string): string {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  // Automatically finds all unique roles in your company to build the dropdown
  extractRoles() {
    const allRoles = this.employees.map((e) => e.role).filter((r) => r);
    this.roles = ['All', ...new Set(allRoles)];
  }

  // Runs every time the user types in the search bar or changes the dropdown
  applyFilters() {
    this.filteredEmployees = this.employees.filter((emp) => {
      // 1. Check Search Query (matches name, role, email, or phone)
      const searchStr = this.searchQuery.toLowerCase();
      const matchesSearch =
        (emp.name && emp.name.toLowerCase().includes(searchStr)) ||
        (emp.role && emp.role.toLowerCase().includes(searchStr)) ||
        (emp.email && emp.email.toLowerCase().includes(searchStr)) ||
        (emp.phone && emp.phone.toLowerCase().includes(searchStr));

      // 2. Check Role Dropdown
      const matchesRole = this.selectedRole === 'All' || emp.role === this.selectedRole;

      return matchesSearch && matchesRole;
    });
  }

  openModal(employee?: any) {
    this.selectedEmployeeToEdit = employee || null;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedEmployeeToEdit = null;
  }

  handleSave(employeeData: any) {
    if (employeeData.id && employeeData.id > 0) {
      // Update existing
      this.employeeService.updateEmployee(employeeData.id, employeeData).subscribe({
        next: () => {
          this.loadEmployees(); // Reload fresh data
          this.closeModal();
        },
        error: (err) => console.error('Failed to update employee', err),
      });
    } else {
      // Create new
      this.employeeService.createEmployee(employeeData).subscribe({
        next: () => {
          this.loadEmployees(); // Reload fresh data
          this.closeModal();
        },
        error: (err) => console.error('Failed to create employee', err),
      });
    }
  }

  deleteEmployee(id: number) {
    if (confirm('Are you sure you want to remove this employee from the directory?')) {
      this.employeeService.deleteEmployee(id).subscribe({
        next: () => {
          this.loadEmployees(); // Reload fresh data
        },
        error: (err) => console.error('Failed to delete employee', err),
      });
    }
  }
}
