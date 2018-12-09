import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ChildActivationEnd } from '@angular/router';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';

import { GetEmployeeService } from '../services/get-employee.service';
import { LogOutService } from '../services/logOut.service';
import { AlertComponent } from '../alert/alert.component';

import { CookieService } from 'ngx-cookie-service';
import { Subscription } from 'rxjs';

const LOG_IN_STRING: string = 'Log in';
const LOG_OUT_STRING: string = 'Log out';
const STATUS_FAILURE: number = 0;
const STATUS_SUCCESS: number = 1;
const CODE_SESSION_DOESNT_EXIST: number = 401;

@Component({
    selector: 'app-employee',
    templateUrl: './employee.component.html',
    styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnInit {

    constructor(
        private getEmployeeService: GetEmployeeService,
        private logOutService: LogOutService,
        private router: Router,
        private route: ActivatedRoute,
        private location: Location,
        public dialog: MatDialog,
        private cookieService: CookieService
    ) { }

    //contains Username information
    username: string;
    loginLogout: string;
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
        uid: string;
    }
    //contains params sended with 'logout' request
    logOutParams: {
        logout: number;
    }
    //contains router subscriptionObject
    routerSub = Subscription.EMPTY;

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

    onLogInLogOut(): void {
        if(this.loginLogout === LOG_IN_STRING){
            this.router.navigate(['/login']);
        } else {
            this.logOutParams = {logout: 1};
            this.logOutService.logOutRequest(this.logOutParams).subscribe(
                response => {
                    if(response.status === STATUS_SUCCESS) {
                        this.getEmployeeInfo({uid: this.uid});
                    } else {
                        if(response.code === CODE_SESSION_DOESNT_EXIST) {
                            this.getEmployeeInfo({uid: this.uid});
                        } else {
                            this.dialog.open(AlertComponent, {
                                width: '250px',
                                data: {error: response.message}
                            });
                        }
                    }
                },
                error => {
                    this.dialog.open(AlertComponent, {
                        width: '250px',
                        data: {error: error.statusText}
                    });
                }
            )
        }
    }

    //redirects to page with user information
    onSelectUser(): void {
        this.router.navigate(['/employee'], {queryParams: { uid: this.username},
            queryParamsHandling: 'merge'});

    }

    //returns back in history
    returnBack(): void {
        this.location.back();
    }

    getEmployeeInfo(params): void {
        this.uid = params['uid'];
        if(this.uid === undefined){
            this.uid = this.username;
        }

        this.isLoading = true;

        this.requestParams = {uid: this.uid};

        this.getEmployeeService.getEmployeeRequest(this.requestParams).subscribe(
            response => {
                if(response.status === STATUS_FAILURE) {
                    if(response.code === CODE_SESSION_DOESNT_EXIST) {
                        this.username = '';
                        this.loginLogout = LOG_IN_STRING;

                        this.title = Object.values(response.columns);
                        this.record = response.records;
                    } else {
                        this.dialog.open(AlertComponent, {
                            width: '250px',
                            data: {error: response.message}
                        });
                    }
                } else {
                    this.username = this.cookieService.get('login');
                    this.loginLogout = LOG_OUT_STRING;

                    this.title = Object.values(response.columns);
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


}
