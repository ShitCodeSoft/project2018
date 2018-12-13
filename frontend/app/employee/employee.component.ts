import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ChildActivationEnd } from '@angular/router';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';

import { GetEmployeeService } from '../services/get-employee.service';
import { SaveProfileService } from '../services/saveProfile.service';
import { AlertComponent } from '../alert/alert.component';

import { CookieService } from 'ngx-cookie-service';
import { Subscription } from 'rxjs';

const STATUS_FAILURE: number = 0;
const STATUS_SUCCESS: number = 1;
const CODE_SESSION_DOESNT_EXIST: number = 401;
const NO_EDIT_STATUS: number = 0;
const EDIT_STATUS: number = 1;

@Component({
    selector: 'app-employee',
    templateUrl: './employee.component.html',
    styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnInit {

    constructor(
        private getEmployeeService: GetEmployeeService,
        private saveProfileService: SaveProfileService,
        private router: Router,
        private route: ActivatedRoute,
        private location: Location,
        public dialog: MatDialog,
        private cookieService: CookieService
    ) { }

    //contains Username information
    username: string;
    //used for changing progressBar view
    isLoading: boolean;
    //contains uid to  send request by
    uid: string;
    //contains response information about employee
    record: Object;
    //contains titles of record attributs
    title: Object;
    //contains 'get employee record' request params
    requestParams: {
        edit: number;
        user: string;
    }
    //contains router subscriptionObject
    routerSub = Subscription.EMPTY;
    photo: string;
    isEdit: boolean = false;
    isSaving: boolean = false;
    isEditable: boolean = false;
    savingParams;
    isError: boolean = false;
    isSuccess: boolean = false;
    errorMsg: string;

    //gets information about the employee
    ngOnInit() {

        var queryParams;
        this.route.queryParams.subscribe(params => {
            queryParams = params;
        });
        this.getEmployeeInfo(queryParams);

        this.routerSub = this.router.events
        .subscribe(result => {
            if(result instanceof ChildActivationEnd) {
                this.getEmployeeInfo(result.snapshot.queryParams);
            }
        });
    }

    ngOnDestroy() {
        this.routerSub.unsubscribe();
    }

    //returns back in history
    returnBack(): void {
        this.location.back();
    }

    onEdit(): void {
        this.isEdit = !this.isEdit;
    }

    getEmployeeInfo(params): void {
        this.uid = params['user'];
        if(this.uid === undefined){
            this.uid = this.cookieService.get('login');
        }

        this.isLoading = true;

        this.requestParams = {edit: NO_EDIT_STATUS, user: this.uid};

        this.getEmployeeService.getEmployeeRequest(this.requestParams).subscribe(
            response => {
                if(response.status === STATUS_FAILURE) {
                    if(response.code === CODE_SESSION_DOESNT_EXIST) {
                        this.router.navigate(['/login']);
                    } else {
                        this.dialog.open(AlertComponent, {
                            width: '250px',
                            data: {error: response.message}
                        });
                    }
                } else {
                    this.username = this.cookieService.get('login');


                    if(response.is_edit === 1) {
                        this.isEditable = true;
                        console.log(response.is_edit);
                    }

                    this.title = Object.values(response.fields);
                    console.log(this.title);
                    this.record = response.records;
                }
                this.isLoading = false;
            },
            error => {
                this.dialog.open(AlertComponent, {
                    width: '250px',
                    data: {error: error.statusText}
                });
            });   
    }

    onSave(): void {
        this.isSaving = true;

        this.savingParams = {edit: EDIT_STATUS, fields: this.title};

        this.saveProfileService.saveProfileRequest(this.savingParams).subscribe(
            response => {
                if(response.status === STATUS_FAILURE) {
                    if(response.code === CODE_SESSION_DOESNT_EXIST) {
                        this.router.navigate(['/login']);
                    } else {
                        this.isError = true;
                        this.errorMsg = response.message;
                    }
                } else {
                    this.isSuccess = true;
                    this.errorMsg = response.message;
                }
                this.isSaving = false;
            },
            error => {
                this.dialog.open(AlertComponent, {
                    width: '250px',
                    data: {error: error.statusText}
                });
            });
    }
}
