import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthResponse } from '../models/authResponse';
import { LOGIN_CGI_URL } from '../configs/constants';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    constructor(
        private httpClient: HttpClient
    ) { }

    public auth(login: string, password: string): Observable<AuthResponse>{
        return this.httpClient.post<AuthResponse>(LOGIN_CGI_URL, { login: login,
            password: password });
    }
}