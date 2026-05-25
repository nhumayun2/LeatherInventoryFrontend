import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPassword {
  email: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    if (!this.email.trim()) {
      this.errorMessage = 'Please enter your registered email address.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.forgotPassword(this.email.trim()).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = response.message || 'Verification code dispatched successfully.';
        
        // Securely pass the email forward to the verification grid after a brief delay
        setTimeout(() => {
          this.router.navigate(['/reset-password'], { 
            queryParams: { email: this.email.trim() } 
          });
        }, 2000);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to request reset code. Please try again.';
      }
    });
  }
}