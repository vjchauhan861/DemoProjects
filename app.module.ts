import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AgGridModule } from 'ag-grid-angular';
import { HttpClient, HttpClientModule } from '@angular/common/http';
// import 'ag-grid-enterprise';
@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AgGridModule,
    HttpClientModule,
    
  ],
  providers: [
    HttpClientModule,
    HttpClient,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
