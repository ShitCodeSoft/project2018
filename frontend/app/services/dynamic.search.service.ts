import { HttpClient, HttpParams} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { SearchResponse } from '../models/searchResponse';
import { SEARCH_CGI_URL } from '../configs/constants';

@Injectable({
    providedIn: 'root'
})

export class DynamicSearchService {

    constructor(
        private httpClient: HttpClient
    ) { }

    public search(pattern: string): Observable<SearchResponse>{
        let params = new HttpParams();
        pattern = pattern.replace(/\+/, encodeURIComponent('+'));
        if(pattern != null) {
            params = params.append('command', pattern);
        }
        return this.httpClient.get<SearchResponse>(SEARCH_CGI_URL, { params: params });
    }
}