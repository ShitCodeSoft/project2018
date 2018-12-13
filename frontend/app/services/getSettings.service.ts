import { HttpClient, HttpParams} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Response } from '../models/response';
import { SETTINGS_CGI_URL } from '../configs/constants';

@Injectable({
    providedIn: 'root'
})

export class GetSettingsService {

    constructor(
        private httpClient: HttpClient
    ) { }

    public getSettingsRequest(params: {}): Observable<Response>{
        return this.httpClient.get<Response>(SETTINGS_CGI_URL, {params: params});
    }
}