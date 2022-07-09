import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  CellClickedEvent,
  ColDef,
  ColumnApi,
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
  // destroySubject: Subject<void> = new Subject<void>();
  gridApi!: GridApi;
  gridColumnApi!: ColumnApi;
  cellClickMessage: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.columnDefs = [
      {
        colId: 'make',
        field: 'make',
        headerName: 'Vehicle Make',
        filter: 'agTextColumnFilter',
      },
      { colId: 'model', field: 'model', headerName: 'Vehicle Model' },
      {
        field: 'price',
        headerName: 'Onroad Price',
        filter: 'agNumberColumnFilter',
      },
    ];
    this.defaultColDef = {
      sortable: true,
    };
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.http
      .get<Array<{ [key: string]: string | number }>>(
        'https://www.ag-grid.com/example-assets/row-data.json'
      )
      .subscribe({
        next: (data: Array<{ [key: string]: string | number }>) => {
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

  SortByMakeModel(sort: 'asc' | 'desc') {
    this.gridColumnApi.applyColumnState({
      state: [
        { colId: 'make', sort },
        { colId: 'model', sort },
      ],
      defaultState: { sort: null },
    });
  }

  extractCSV() {
    this.gridApi.exportDataAsCsv();
  }

  selectAllRows() {
    this.gridApi.selectAll();
  }

  ngOnDestroy() {
    // this.destroySubject.next();
    // this.destroySubject.complete();
  }
}
