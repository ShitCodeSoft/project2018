import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { AuthService } from '../services/auth.service';
import { AlertComponent } from '../alert/alert.component';

const STATUS_SUCCESS: number = 1;
const ENTER_KEY_VALUE: number = 13;

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

    //contains data from 'username' input
    username: string;
    //contains data from 'password' input
    password: string;
    //used for changing progressbar view
    isLoading: boolean = true;
    //used for changing error messages view
    isError: boolean = false;
    //contains returned errormessage from server
    errorMessage: string;

    @ViewChild('passwd') passwdInputElement: ElementRef;

    constructor(
        private authService: AuthService,
        private router: Router,
        public dialog: MatDialog
    ) { }

    //checking existed session
    ngOnInit(): void {
        this.authService.auth(null, null).subscribe(
            response => {
                response.status === STATUS_SUCCESS ? this.router.navigate(['/'])
                    : this.isLoading = false;
            },
            error => {
                this.isLoading = false;
                this.dialog.open(AlertComponent, {
                    width: '250px',
                    data: {error: error.statusText}
                 });
            }
        );
    }

    onKeyPressedLogin(event): void {
        if(event.keyCode === ENTER_KEY_VALUE) {
            this.passwdInputElement.nativeElement.focus();
        }
    }

    onKeyPressedPassword(event): void {
        if(event.keyCode === ENTER_KEY_VALUE) {
            this.login();
        }
    }

    //send credential to the server for verification
    login(): void {
        this.isLoading = true;
        this.authService.auth(this.username, this.password).subscribe(
            response => {
                if(response.status === STATUS_SUCCESS) {
                    this.router.navigate(['/']);
                } else {
                    this.isLoading = false;
                    this.isError = true;
                    this.errorMessage = response.message;
                }
            },
            error => {
                this.isLoading = false;
                this.dialog.open(AlertComponent, {
                    width: '250px',
                    data: {error: error.statusText}
                 });
            }
        );
    }

}