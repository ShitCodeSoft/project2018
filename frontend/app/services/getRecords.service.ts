import { HttpClient, HttpParams} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Response } from '../models/response';
import { MAIN_CGI_URL } from '../configs/constants';

@Injectable({
    providedIn: 'root'
})

export class GetRecordsService {

    constructor(
        private httpClient: HttpClient
    ) { }

    public getRecordsRequest(params: {}): Observable<Response>{
        for(var p in params){
            if(params[p] === null){
                delete params[p];
            }
        }
        return this.httpClient.get<Response>(MAIN_CGI_URL, {params: params});
    }
}