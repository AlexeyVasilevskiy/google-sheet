import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { SheetComponent } from './sheet/sheet.component';

@NgModule({
  imports: [BrowserModule, FormsModule],
  declarations: [AppComponent, SheetComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
