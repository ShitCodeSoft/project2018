import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Response } from '../models/response';
import { MAIN_CGI_URL } from '../configs/constants';

@Injectable({
    providedIn: 'root'
})
export class LogOutService {

    constructor(
        private httpClient: HttpClient
    ) { }

    public logOutRequest(params): Observable<Response>{
        return this.httpClient.get<Response>(MAIN_CGI_URL, {params: params});
    }
}