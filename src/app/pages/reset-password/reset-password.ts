import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPassword implements OnInit {
  resetData = {
    email: '',
    resetCode: '',
    newPassword: ''
  };

  confirmPassword: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Automatically catch the forwarded email address from the query string parameters
    this.route.queryParams.subscribe((params) => {
      if (params['email']) {
        this.resetData.email = params['email'];
      }
    });
  }

  onSubmit() {
    if (!this.resetData.email.trim() || !this.resetData.resetCode.trim() || !this.resetData.newPassword.trim()) {
      this.errorMessage = 'All verification fields are strictly required.';
      return;
    }

    if (this.resetData.resetCode.trim().length !== 6) {
      this.errorMessage = 'The reset verification token must be exactly 6 digits long.';
      return;
    }

    if (this.resetData.newPassword !== this.confirmPassword) {
      this.errorMessage = 'New passwords do not match. Verify your spelling.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.resetPassword(this.resetData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = response.message || 'Password securely reset successfully!';
        
        // Push the user back to login view after confirmation
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2500);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Verification failed. Incorrect code or expired timeframe.';
      }
    });
  }
}