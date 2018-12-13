import { HttpClient, HttpParams} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Response } from '../models/response';
import { SETTINGS_CGI_URL } from '../configs/constants';

@Injectable({
    providedIn: 'root'
})

export class SaveSettingsService {

    constructor(
        private httpClient: HttpClient
    ) { }

    public saveSettingsRequest(params: {}): Observable<Response>{
        return this.httpClient.post<Response>(SETTINGS_CGI_URL, {params: params});
    }
}