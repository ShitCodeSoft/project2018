import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatMenuTrigger } from '@angular/material';
import { MatDialog } from '@angular/material/dialog';

import { AlertComponent } from '../alert/alert.component';
import { CookieService } from 'ngx-cookie-service';
import { LogOutService } from '../services/logOut.service';

const LOG_OUT_PARAMETER:number = 1;
const STATUS_FAILURE: number = 0;
const STATUS_SUCCESS: number = 1;
const CODE_SESSION_DOESNT_EXIST: number = 401;

@Component({
 	selector: 'app-header',
 	templateUrl: './header.component.html',
 	styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

	username: string = 'Username';
	//contains params sended with 'logout' request
    logOutParams: {
        logout: number;
    }

 	constructor(
 		private router: Router,
 		private logOutService: LogOutService,
 		public dialog: MatDialog,
 		private cookieService: CookieService
 	) { }

 	ngOnInit() {
 		this.cookieService.set('login', 'admin');
 		this.username = this.cookieService.get('login');	
 	}

 	onLogo() {
 		this.router.navigate(['/index']);
 	}

 	//redirects to page with user information
    onSelectUser(): void {
        this.router.navigate(['/employee'], {queryParams: { user: this.username} });
    }

    onAdminPanel(): void {
    	this.router.navigate(['/admin-panel']);
    }

    onSelectSettings(): void {
    	this.router.navigate(['/settings']);
    }

 	//redirects to login page
    onLogOut(): void {
        this.logOutParams = {logout: LOG_OUT_PARAMETER};
        this.logOutService.logOutRequest(this.logOutParams).subscribe(
            response => {
                if(response.status === STATUS_SUCCESS) {
                    this.router.navigate(['/login']);
                } else {
                    if(response.code === CODE_SESSION_DOESNT_EXIST) {
                        this.router.navigate(['/login']);
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

    //settings controller
 	@ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
    closeSettingsMenu() {
        this.trigger.closeMenu();
    }

}
