import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AgGridAngular, ICellRendererAngularComp } from 'ag-grid-angular';
import {
  CellClickedEvent,
  CellEditingStartedEvent,
  ColDef,
  ColumnApi,
  Context,
  GridApi,
  GridOptions,
  RowNode,
  TextDataTypeDefinition,
} from 'ag-grid-community';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;
  colDefs: ColDef[] = [
    { field: 'athlete', sortable: true, filter: true },
    { field: 'age', sortable: true, filter: true },
    { field: 'year', sortable: true, filter: true },
    { field: 'date', sortable: true, filter: true },
    {
      field: 'lastName',
      editable: true, // Enable cell editing
      cellEditor: 'agGridAppianTextEditor', // Custom cell editor
      sortable: true,
      filter: true,
    },
  ];
  rowData$!: Observable<any[]>;
  constructor(private httpClient: HttpClient) {}
  ngOnInit(): void {
    this.rowData$ = this.httpClient.get<any[]>(
      'https://www.ag-grid.com/example-assets/olympic-winners.json'
    );
  }
  
  onCellClicked(e: CellClickedEvent) {
    console.log(e);
  }
  clearSelection(){
    this.agGrid.api.deselectAll();
    this.agGrid.api.paginationGoToPage(4)
  }
  onCellEditingStarted( event: CellEditingStartedEvent<TextDataTypeDefinition>){
  console.log(event);
}
gridOptions :GridOptions= {
  defaultColDef: {
    editable: true,
    enableRowGroup: true,
    enablePivot: true,
    enableValue: true,
    sortable: true,
    resizable: true,
    filter: true,
    flex: 1,
    minWidth: 100,
  },
  suppressRowClickSelection: true,
  groupSelectsChildren: true,
  // debug: true,
  rowSelection: 'multiple',
  rowGroupPanelShow: 'always',
  pivotPanelShow: 'always',
  columnDefs: this.colDefs,
  pagination: true,
  paginationPageSize: 10,
  // autoGroupColumnDef: autoGroupColumnDef,
  // onFirstDataRendered: onFirstDataRendered,
  paginationNumberFormatter: (params:any) => {
    return '[' + params.value.toLocaleString() + ']';
  },
};
}
