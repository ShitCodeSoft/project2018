import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';

import { GetSettingsService } from '../services/getSettings.service';
import { ChangePasswordService } from '../services/changePassword.service';
import { SaveSettingsService } from '../services/saveSettings.service';
import { AlertComponent } from '../alert/alert.component';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
	oldPasswd: string;
	newPasswd: string;
	confirmPasswd: string;
}

const STATUS_SUCCESS: number = 1;
const STATUS_FAILURE: number = 0;
const GETTING_SETTINGS_STATUS: number = 0;
const SAVING_SETTINGS_STATUS: number = 0;

@Component({
 	selector: 'app-settings',
 	templateUrl: './settings.component.html',
 	styleUrls: ['./settings.component.css'],
 })
export class SettingsComponent implements OnInit {
	//used for changing progressBar view
	isLoading: boolean;
	//contains params sended with  'get settings' request
    getSettingsParams: {
        id: string;
        save: number;
    };
    //contains id of current user
    id: string;
    //contains old passwd
    oldPasswd: string;
    //contains new passwd
    newPasswd: string;
    //contains confirmed new passwd
    confirmPasswd: string;
    //contains user table fields info
    fieldsInfo: {
    	shortcut: string;
    	name: string; 
    	set: number;
    }[];

    isSaving: boolean = false;

    isSuccess: boolean = false;

    isError: boolean = false;

    responseMsg: string = '';

 	constructor(
 		private getSettingsService: GetSettingsService,
 		private saveSettingsService: SaveSettingsService,
 		private cookieService: CookieService,
 		private router: Router,
 		public dialog: MatDialog
 	) { }

 	ngOnInit() {
 		this.id = this.cookieService.get('login');
 		this.getSettings(this.id, GETTING_SETTINGS_STATUS);
 	}

 	//executing dialog for changing password
 	onChangePassword(): void {
 		this.dialog.open(ChangePasswdDialog, {
 			width: '30%',
 			minWidth: '250px',
 			data: {oldPasswd: this.oldPasswd, newPasswd: this.newPasswd, confirmPasswd: this.confirmPasswd}
 		});
 	}

 	onCheckedChange(target, event): void {
 		this.isError = false;
 		this.isSuccess = false;
 		target.set = event.checked ? 1 : 0;
 	}

 	onSaveSettings(): void {
 		this.isSaving = true;
 		this.isError = false;
 		this.isSuccess = false;
 		this.saveSettingsService.saveSettingsRequest({save: 1, fields: this.fieldsInfo}).subscribe(
            response => {
            	console.log(2);
                if(response.status === STATUS_FAILURE) {
                    if(response.code === 401) {
                        this.router.navigate(['/login']);
                    } else if(response.code === 406) {
                    	this.isError = true;
                    	this.responseMsg = response.message;
                    }
                } else if(response.status === STATUS_SUCCESS) {
                	if(response.code === 203) {
                    	this.isSuccess = true;
                    	this.responseMsg = response.message;
                    }
                }
                this.isSaving = false;
            },
            error => {
            	console.log(3);
                this.dialog.open(AlertComponent, {
                    width: '250px',
                    data: {error: error.statusText}
                });
            });
 	}

 	//sending get settings request to back
 	getSettings(id: string, save: number): void {
 		this.isLoading = true;

 		this.getSettingsParams = {id: id, save: save};

 		this.getSettingsService.getSettingsRequest(this.getSettingsParams).subscribe(
            response => {
                if(response.status === STATUS_FAILURE) {
                    if(response.code === 401) {
                        this.router.navigate(['/login']);
                    }
                } else {
                	this.fieldsInfo = [];

                    for(var k in response.fields){
                    	this.fieldsInfo.push({shortcut: response.fields[k].shortcut, name: response.fields[k].name, set: response.fields[k].set});
                    }

                    console.log(this.fieldsInfo);
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

const SAVE_PASSWORDS_STATUS: number = 1;

@Component({
	selector: 'change-passwd-dialog',
	templateUrl: 'change.passwd.component.html',
	styleUrls: ['change.passwd.component.css']
})

export class ChangePasswdDialog {

	isShowOldPasswd: boolean = false;
	isShowNewPasswd: boolean = false;
	isShowConfirmPasswd: boolean = false;
	oldPasswdVisible: string = 'visibility';
	newPasswdVisible: string = 'visibility';
	confirmPasswdVisible: string = 'visibility';
	isProcessingPasswd: boolean = false;
	isShowError: boolean = false;
    isShowSuccess: boolean = false;
	errorMsg: string;
	getSettingsParams: {
		old_password: string;
		new_password: string;
	}[];

	constructor(
		public dialogRef: MatDialogRef<ChangePasswdDialog>,
		@Inject(MAT_DIALOG_DATA) public data: DialogData,
		private changePasswordService: ChangePasswordService,
        private router: Router,
        public dialog: MatDialog
	){}

	onShowOldPasswd(): void {
		if(this.isShowOldPasswd) {
			this.isShowOldPasswd = false;
			this.oldPasswdVisible = 'visibility';
		} else {
			this.isShowOldPasswd = true;
			this.oldPasswdVisible = 'visibility_off';
		}
	}

	onShowNewPasswd(): void {
		if(this.isShowNewPasswd) {
			this.isShowNewPasswd = false;
			this.newPasswdVisible = 'visibility';
		} else {
			this.isShowNewPasswd = true;
			this.newPasswdVisible = 'visibility_off';
		}
	}

	onShowConfirmPasswd(): void {
		if(this.isShowConfirmPasswd) {
			this.isShowConfirmPasswd = false;
			this.confirmPasswdVisible = 'visibility';
		} else {
			this.isShowConfirmPasswd = true;
			this.confirmPasswdVisible = 'visibility_off';
		}
	}

	onConfirm(): void {
		this.isProcessingPasswd = true;
        this.isShowError = false;
        this.isShowSuccess = false;

		if(!this.data.oldPasswd || !this.data.newPasswd || !this.data.confirmPasswd) {
			this.errorMsg = 'All fields must be filled';
			this.isShowError = true;
			this.isProcessingPasswd = false;
		} else if(this.data.newPasswd !== this.data.confirmPasswd){
			this.errorMsg = 'Passwords are not equal';
			this.isShowError = true;
			this.isProcessingPasswd = false;
		} else {
            this.changePassword(SAVE_PASSWORDS_STATUS, this.data.oldPasswd, this.data.newPasswd);
        }
	}

	onClose(): void {
		this.dialogRef.close();
	}

	changePassword(change: number, old_password: string, new_password: string): void {
 		this.getSettingsParams = [{old_password: old_password, new_password: new_password}];
        console.log(this.getSettingsParams);
 		this.changePasswordService.changePasswordRequest({change: SAVE_PASSWORDS_STATUS, fields: this.getSettingsParams}).subscribe(
            response => {
                if(response.status === STATUS_FAILURE) {
                    if(response.code === 401) {
                        this.router.navigate(['/login']);
                    } else if(response.code === 406) {
                    	this.isShowError = true;
                    	this.errorMsg = response.message;
                    }
                } else if(response.status === STATUS_SUCCESS) {
                    if(response.code === 204) {
                    	this.isShowSuccess = true;
                    	this.errorMsg = response.message;
                    }
                }
                this.isProcessingPasswd = true;
            },
            error => {
                this.dialog.open(AlertComponent, {
                    width: '250px',
                    data: {error: error.statusText}
                });
            });
 	}
}