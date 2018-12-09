import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule }   from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainComponent } from './main/main.component';
import { LoginComponent } from './login/login.component';
import { EmployeeComponent } from './employee/employee.component';
import { AlertComponent } from './alert/alert.component';

import { GetRecordsService } from './services/getRecords.service';
import { DynamicSearchService } from './services/dynamic.search.service';
import { LogOutService } from './services/logOut.service';
import { AuthService } from './services/auth.service';
import { GetEmployeeService } from './services/get-employee.service';

import { CookieService } from 'ngx-cookie-service';


@NgModule({
    declarations: [
        AppComponent,
        MainComponent,
        LoginComponent,
        EmployeeComponent,
        AlertComponent
    ],
    imports: [
        BrowserModule,
        ReactiveFormsModule,
        HttpClientModule,
        BrowserAnimationsModule,
        MatSlideToggleModule,
        MatProgressSpinnerModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        FormsModule,
        MatTableModule,
        MatPaginatorModule,
        AppRoutingModule,
        MatCardModule,
        MatTooltipModule,
        MatSortModule,
        MatDialogModule,
        MatMenuModule
    ],
    providers: [
        GetRecordsService,
        DynamicSearchService,
        LogOutService,
        AuthService,
        CookieService
    ],
    bootstrap: [AppComponent],
    entryComponents: [
        AlertComponent
    ]
})
export class AppModule { }
