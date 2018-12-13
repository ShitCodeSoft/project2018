import { HttpClient, HttpParams} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Response } from '../models/response';
import { EMPLOYEE_CGI_URL } from '../configs/constants';

@Injectable({
    providedIn: 'root'
})

export class SaveProfileService {

    constructor(
        private httpClient: HttpClient
    ) { }

    public saveProfileRequest(params: {}): Observable<Response>{
        return this.httpClient.post<Response>(EMPLOYEE_CGI_URL, {params: params});
    }
}