import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import {
  CellClickedEvent,
  ColDef,
  ColumnApi,
  GridApi,
  GridReadyEvent,
} from 'ag-grid-community';
import {
  GetQuickFilterTextParams,
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
  rowDraggable: boolean = false;
  defaultColDef!: ColDef;
  destroySubject: Subject<void> = new Subject<void>();
  gridApi!: GridApi;
  gridColumnApi!: ColumnApi;
  cellClickMessage: string = '';
  columnTypes: { [key: string]: ColDef };
  indexPosition: FormControl = new FormControl();
  searchBox: FormControl = new FormControl('');

  rowStyleObject = {
    color: 'orange',
  };

  getRowClass({ data }) {
    if (data.price > 45000) {
      return 'text-green';
    } else {
      return 'text-white';
    }
  }

  getRowClassRules = {
    'text-green': ({ data }) => data.price > 45000,
    'text-white': ({ data }) => data.price < 45000,
  };

  // cellValueChanged(event) {
  //   console.log(event.newValue);
  // }

  rowValueChanged(event) {
    console.log(event);
  }

  constructor(private http: HttpClient) {
    this.columnTypes = {
      nonEditable: {
        editable: false,
      },
      textFilter: {
        filter: 'agTextColumnFilter',
      },
    };
  }

  ngOnInit(): void {
    this.columnDefs = [
      {
        colId: 'make',
        field: 'make',
        headerName: 'Vehicle Make',
        checkboxSelection: true,
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        type: 'textFilter',
        filterParams: {
          filterOptions: ['contains', 'startsWith'],
        },
        width: 300,
        suppressMenu: true,
        floatingFilter: true,
        rowDrag: true,
        valueParser: ({ newValue, oldValue }) => {
          if (isNaN(Number(newValue))) {
            return newValue;
          }
          return oldValue;
        },
        // rowSpan: ({ data }) => {
        //   return 2;
        // },
        // cellClass: 'bg-green',
        // lockPosition: true,
        // cellEditor: 'agSelectCellEditor',
        // cellEditorParams: { values: ['Ford', 'Porsche', 'Hyundai', 'Toyota'] },
      },
      {
        valueGetter: ({ data }) => {
          return (
            data.price.toString().substr(0, 3) + '-' + data.make.substr(0, 3)
          );
        },
        valueSetter: ({ data, newValue }) => {
          const split = newValue.split('-');
          if (split.length === 2) {
            data.price = Number(split[0]) * 1000 + 999;
            data.make = split[1] + data.make.substr(3);
          } else {
            return false;
          }
        },
      },
      {
        colId: 'model',
        field: 'model',
        headerName: 'Vehicle Model',
        cellRenderer: (params: ICellRendererParams) =>
          `<b>${params.data.model}</b>`,
        getQuickFilterText: (params: GetQuickFilterTextParams) => {
          return params.data.model;
        },
        type: ['nonEditable', 'textFilter'],
        suppressMovable: true,
        pinned: 'right',
        // cellStyle: ({ value }) =>
        //   value === 'Boxter'
        //     ? {
        //         color: 'red',
        //       }
        //     : { 'background-color': 'green' },
      },
      {
        colId: 'price',
        field: 'price',
        headerName: 'Onroad Price',
        filter: 'agNumberColumnFilter',
        filterParams: {
          buttons: ['apply', 'cancel', 'clear', 'reset'],
        },
        // cellClassRules: {
        //   'bg-red': ({ data }) => data.price < 35000,
        //   'bg-blue': ({ data }) => data.price > 35000,
        // },
        // valueGetter: (params: ValueGetterParams) => 'Rs. ' + params.data.price,
      },
    ];
    this.defaultColDef = {
      sortable: true,
      // editable: true,
      resizable: true,
      editable: ({ data }) => {
        if (data.price > 35000) {
          return true;
        }
        return false;
      },
    };
    this.searchBox.valueChanges
      .pipe(takeUntil(this.destroySubject))
      .subscribe((data) => {
        this.gridApi.setQuickFilter(data);
      });
  }

  movePrice() {
    this.gridColumnApi.moveColumn('price', this.indexPosition.value);
  }

  movePriceandModel() {
    this.gridColumnApi.moveColumns(
      ['model', 'price'],
      this.indexPosition.value
    );
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

  supressRowDrag() {
    this.rowDraggable = !this.rowDraggable;
    this.gridApi.setSuppressRowDrag(this.rowDraggable);
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
