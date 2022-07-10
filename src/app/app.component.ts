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
import {
  ICellRendererParams,
  RowNode,
  ValueGetterParams,
} from 'ag-grid-community/dist/lib/main';
import { Subject, interval } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';
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
        checkboxSelection: true,
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
      },
      {
        colId: 'model',
        field: 'model',
        headerName: 'Vehicle Model',
        cellRenderer: (params: ICellRendererParams) =>
          `<b>${params.data.model}</b>`,
      },
      {
        colId: 'price',
        field: 'price',
        headerName: 'Onroad Price',
        filter: 'agNumberColumnFilter',
        valueGetter: (params: ValueGetterParams) => 'Rs. ' + params.data.price,
      },
    ];
    this.defaultColDef = {
      sortable: true,
    };
  }

  onRowSelectionChange() {
    this.cellClickMessage = this.gridApi
      .getSelectedRows()
      .map((data) => data.make + data.model)
      .join(', ');
  }

  addNewData() {
    this.gridApi.applyTransaction({
      add: [{ make: 'bv', model: 'ss', price: 19091999 }],
    });
  }

  deleteData() {
    const dataTobeDeleted = this.gridApi.getSelectedRows();
    this.gridApi.applyTransaction({
      remove: dataTobeDeleted,
    });
  }

  updateData() {
    const itemsToUpdate: any[] = [];
    this.gridApi.forEachNodeAfterFilterAndSort(function (rowNode, index) {
      // only do first 2
      // if (index >= 2) {
      //   return;
      // }
      const data = rowNode.data;
      data.price = Math.floor(Math.random() * 20000 + 20000);
      itemsToUpdate.push(data);
    });
    const res = this.gridApi.applyTransaction({ update: itemsToUpdate });
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
          // this.gridApi.setRowData(this.rowData);
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
    this.destroySubject.next();
    this.destroySubject.complete();
  }

  togglePrice() {
    const priceColumn = this.gridColumnApi.getColumn('price');
    this.gridColumnApi.setColumnVisible('price', !priceColumn.isVisible());
    this.gridApi.sizeColumnsToFit();
  }
}
