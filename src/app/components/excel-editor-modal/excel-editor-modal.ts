import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-excel-editor-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './excel-editor-modal.html',
  styleUrl: './excel-editor-modal.css',
})
export class ExcelEditorModal implements OnInit {
  @Input() document: any = null; // The FinanceDocument object from the parent
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>(); // Emit when successfully updated

  isLoading = true;
  isSaving = false;

  // SheetJS Data Structures
  workbook: XLSX.WorkBook | null = null;
  sheetName: string = '';
  tableData: any[][] = []; // A 2D array representing rows and columns

  constructor(private http: HttpClient) {}

  ngOnInit() {
    if (this.document && this.document.cloudinaryUrl) {
      this.loadExcelFile();
    }
  }

  loadExcelFile() {
    this.isLoading = true;

    // 1. Download the file from Cloudinary as a Blob (Binary Data)
    this.http.get(this.document.cloudinaryUrl, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const reader = new FileReader();

        reader.onload = (e: any) => {
          // 2. Pass the binary data to SheetJS
          const data = new Uint8Array(e.target.result);
          this.workbook = XLSX.read(data, { type: 'array' });

          // 3. Grab the first sheet
          this.sheetName = this.workbook.SheetNames[0];
          const worksheet = this.workbook.Sheets[this.sheetName];

          // 4. Convert it to a 2D Array so Angular can render an HTML Table
          this.tableData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          this.isLoading = false;
        };

        reader.readAsArrayBuffer(blob);
      },
      error: (err) => {
        console.error('Failed to load file from Cloudinary', err);
        alert('Failed to load the Excel file.');
        this.isLoading = false;
        this.closeModal();
      },
    });
  }

  // --- Grid Editing Controls ---

  updateCell(rowIndex: number, colIndex: number, event: any) {
    this.tableData[rowIndex][colIndex] = event.target.innerText;
  }

  addRow() {
    // Add a new empty row with the same number of columns as the first row
    const numCols = this.tableData[0]?.length || 1;
    this.tableData.push(new Array(numCols).fill(''));
  }

  addColumn() {
    // Add an empty string to the end of every existing row
    this.tableData.forEach((row) => row.push(''));
  }

  // --- Saving Logic ---

  saveChanges() {
    if (!this.workbook) return;
    this.isSaving = true;

    // 1. Convert our 2D HTML Array back into a SheetJS Worksheet
    const newWorksheet = XLSX.utils.aoa_to_sheet(this.tableData);
    this.workbook.Sheets[this.sheetName] = newWorksheet;

    // 2. Generate a new Binary Array representing the .xlsx file
    const excelBuffer: any = XLSX.write(this.workbook, { bookType: 'xlsx', type: 'array' });

    // 3. Package it into a File object
    const newFile = new File([excelBuffer], this.document.fileName, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    // 4. Send it to your C# Backend via FormData
    const formData = new FormData();
    formData.append('ClientId', this.document.clientId.toString());
    formData.append('Document', newFile);

    this.http.post(`${environment.apiUrl}/Finance/Upload`, formData).subscribe({
      next: () => {
        // 🌟 FIX: Automatically delete the OLD file version from the DB and Cloudinary
        this.http.delete(`${environment.apiUrl}/Finance/${this.document.id}`).subscribe({
          next: () => {
            this.isSaving = false;
            this.saved.emit(); // Tell the parent to close modal and refresh the list!
          },
          error: (err) => {
            console.error('Old file cleanup failed, but new file saved.', err);
            this.isSaving = false;
            this.saved.emit();
          },
        });
      },
      error: (err) => {
        console.error('Failed to save changes', err);
        alert('Failed to save the updated file.');
        this.isSaving = false;
      },
    });
  }

  downloadCurrentVersion() {
    if (!this.workbook) return;
    XLSX.writeFile(this.workbook, this.document.fileName);
  }

  closeModal() {
    this.close.emit();
  }
}
