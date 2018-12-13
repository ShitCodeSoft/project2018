import { HttpClient, HttpParams} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Response } from '../models/response';
import { CHANGE_PASSWORD_CGI_URL } from '../configs/constants';

@Injectable({
    providedIn: 'root'
})

export class ChangePasswordService {

    constructor(
        private httpClient: HttpClient
    ) { }

    public changePasswordRequest(params: {}): Observable<Response>{
        return this.httpClient.post<Response>(CHANGE_PASSWORD_CGI_URL, {params: params});
    }
}