import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  CellClickedEvent,
  ColDef,
  GridApi,
  GridReadyEvent,
} from 'ag-grid-community';
import { Subject } from 'rxjs';
// import { GridDataService } from '../services/grid-data.service';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  columnDefs!: ColDef[];
  rowData!: any[];
  defaultColDef!: ColDef;
  destroySubject: Subject<void> = new Subject<void>();
  gridApi!: GridApi;
  cellClickMessage: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.columnDefs = [
      { field: 'make', headerName: 'Vehicle Make' },
      { field: 'model', headerName: 'Vehicle Model' },
      { field: 'price', headerName: 'Onroad Price' },
    ];
    this.defaultColDef = {
      sortable: true,
      filter: true,
    };
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.http
      .get<any[]>('https://www.ag-grid.com/example-assets/row-data.json')
      .subscribe({
        next: (data) => {
          this.rowData = data;
        },
      });
    this.gridApi.sizeColumnsToFit();
  }

  onCellClicked(eventTarget: CellClickedEvent) {
    this.cellClickMessage = `You clicked the cell with value "${eventTarget.value}" and the row index is "${eventTarget.rowIndex}"`;
  }

  deselectRowSelection() {
    this.gridApi.deselectAll();
  }

  ngOnDestroy() {
    this.destroySubject.next();
    this.destroySubject.complete();
  }
}
