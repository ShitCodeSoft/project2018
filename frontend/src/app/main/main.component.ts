import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, ActivatedRoute, NavigationStart, ChildActivationEnd } from '@angular/router';
import { Location, PlatformLocation } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';

import { GetRecordsService } from '../services/getRecords.service';
import { DynamicSearchService } from '../services/dynamic.search.service';
import { LogOutService } from '../services/logOut.service';
import { MAIN_PAGE_SIZES } from '../configs/constants';
import { environment } from '../../environments/environment';
import { AlertComponent } from '../alert/alert.component';
import { Response } from '../models/response';

import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { pipe, Subscription } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

const LOG_IN_STRING: string = 'Log in';
const LOG_OUT_STRING: string = 'Log out';
const SIMPLE_MODE: string = 'Simple';
const GRAPHIC_MODE: string = 'Graphic';
const STATUS_SUCCESS: number = 1;
const STATUS_FAILURE: number = 0;
const ARROW_DOWN_KEY: number = 40;
const ARROW_UP_KEY: number = 38;
const ENTER_KEY: number = 13;
const MINIMAL_NUMBER_OF_COLUMNS = 2;
const SCREEN_WIDTH_CUP = 860;

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit, OnDestroy {

    //contains Username information
    username: string;
    loginLogout: string;
    //contains view mode parameter i.e. 'Simple', 'Graphic'
    viewMode: string;
    //used for changing progressBar view
    isLoading: boolean;
    //contains records information showing in the table
    records: Object;
    //contains json object with columns information
    columns: {
        name: string;
        shortcut: string;
    }[];
    //array with columns will be displayed
    displayedColumns: string[];
    //contains current page index value
    curPageNum: number;
    //contains current count of displayed records
    pageCount: number;
    //number of records will be displayed
    recordsLength: number;
    //array of numbers of records will be displayed
    pageSizeOptions: number[] = MAIN_PAGE_SIZES.slice(0);
    //contains parameters for sorting records
    sortLine: string;
    sortHeader: string;
    sortOrder: string;
    //contains parameters for search request
    searchLine: string;
    //contains search input object
    searchField: FormControl = new FormControl();
    //array of items returned from dynamic search request
    searchItems: string[];
    //used for changing the display of search result dropdown
    isShowDropdown: boolean = false;
    //used for ignoring returned search result from server
    isItemsFromResponse: boolean = false;
    //contains current selected line id from dropdown
    selectedItemId: number = -1;
    //used for detectipns mouse over dropdown
    isUnderDropBox: boolean = false;
    //used for informing user about wrong search
    isWrongSearch: boolean = false;
    //contains params sended with  'get records' request
    getRecordsParams: {
        page: number;
        vm: string;
        pg_num: number;
        search: string;
        sort: string;
    };
    //contains params sended with 'logout' request
    logOutParams: {
        logout: number;
    }
    //userd for detection popstate trigger event
    isPopState: boolean;
    //contains router subscriptionObject
    routerSub = Subscription.EMPTY;
    //contains width of screen
    outerWidth: number;
    //contains showed number of records
    maxColumnsNumber: number;

    constructor(
        private getRecordsService: GetRecordsService,
        private dynamicSearchService: DynamicSearchService,
        private logOutService: LogOutService,
        private router: Router,
        private route: ActivatedRoute,
        public dialog: MatDialog,
        private cookieService: CookieService,
        private location: PlatformLocation
    ) { }

    //initializes displayed table
    ngOnInit() {
        this.isShowDropdown = false;

        if(window.innerWidth < SCREEN_WIDTH_CUP || window.outerWidth < SCREEN_WIDTH_CUP) {
            var i;
            this.columns = environment.columns;
            this.displayedColumns = ['id'];
            for(i = 0; i < this.calculateNumberOfColumns(); i++) {
                this.displayedColumns.push(this.columns[i].shortcut);
            }
        } else {
            this.columns = environment.columns;

            this.displayedColumns = ['id'];
            for(var k in this.columns) {
                this.displayedColumns.push(this.columns[k].shortcut);
            }
        }

        var queryParams;
        this.route.queryParams.subscribe(params => {
            queryParams = params;
        });
        this.initializeView(queryParams);
        this.initializeSearchLine();

        this.routerSub = this.router.events
        .subscribe(result => {
            if(result instanceof NavigationStart) {
                this.isPopState = result.navigationTrigger === 'popstate' ? true : false;
            } else if(result instanceof ChildActivationEnd && this.isPopState) {
                this.initializeView(result.snapshot.queryParams);
            }
        });
    }

    ngOnDestroy() {
        this.routerSub.unsubscribe();
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        if(window.innerWidth < SCREEN_WIDTH_CUP || window.outerWidth < SCREEN_WIDTH_CUP) {
            var i;
            this.columns = environment.columns;
            this.displayedColumns = ['id'];
            for(i = 0;i < this.calculateNumberOfColumns(); i++) {
                this.displayedColumns.push(this.columns[i].shortcut);
            }
        } else {
            this.columns = environment.columns;

            this.displayedColumns = ['id'];
            for(var k in this.columns) {
                this.displayedColumns.push(this.columns[k].shortcut);
            }
        }
    }

    //calculates number of displayed columns
    calculateNumberOfColumns(): number {
        var innerColumns = ((window.innerWidth * 0.9 - 37)/150
            - ((window.innerWidth * 0.9 - 37)/150)%1);
        var outerColumns = ((window.outerWidth * 0.9 - 37)/150
            - ((window.outerWidth * 0.9 - 37)/150)%1);
        var numberOfColumns = innerColumns < outerColumns ? innerColumns : outerColumns;
        return numberOfColumns < 2 ? MINIMAL_NUMBER_OF_COLUMNS : numberOfColumns
    }

    initializeView(queryParams): void {
        this.curPageNum = queryParams['page'] === undefined ? null : queryParams['page'];
        this.viewMode = queryParams['vm'] === undefined ? SIMPLE_MODE
            : queryParams['vm'];
        this.pageCount = queryParams['pg_num'] === undefined ? null : queryParams['pg_num'];
        this.searchLine = queryParams['search'] === undefined || queryParams['search'] === ''
            ? null : queryParams['search'];
        this.sortLine = queryParams['sort'] === undefined ? null : queryParams['sort'];
        if(this.sortLine) {
            if(this.sortLine.match(/\w*[^:]/)) {
                this.sortHeader = this.sortLine.match(/\w*[^:]/).pop();
            }
            if(this.sortLine.match(/[^:]\w*$/)) {
                this.sortOrder = this.sortLine.match(/[^:]\w*$/).pop();
            }
        }
        this.getRecords(true, true, this.curPageNum, this.viewMode, this.pageCount,
            this.searchLine, this.sortLine);
    }

    //initiaizes searchline
    initializeSearchLine(): void {
        this.isItemsFromResponse = false;
        this.searchField.valueChanges
        .pipe(debounceTime(200))
        .pipe(distinctUntilChanged())
        .subscribe(
            result => {
                this.selectedItemId = -1;
                this.isWrongSearch = false;
                if(result === null) {
                    return;
                }
                if(result === '' || result.match(/(\()$|(not\s)$|(and\s)$|(or\s)$/)) {
                    this.isShowDropdown = true
                    this.isItemsFromResponse = false;
                    this.searchItems = environment.columns.map(c => c.name.toLowerCase() + '=');
                } else {
                    if(result.match(/[^\s]+$/)) {
                        if(result.match(/\w+=[^\s]+$/)) {
                            this.isItemsFromResponse = true;
                            this.dynamicSearchService.search(result.match(/\w+=[^\s]+$/)
                                .pop()).subscribe(
                                response => {
                                    if(this.isItemsFromResponse) {
                                        if(response.status === STATUS_SUCCESS) {
                                            this.searchItems = response.records;
                                            this.isShowDropdown = true;
                                        } else {
                                            this.searchItems = [];
                                            this.isShowDropdown = false;
                                        }
                                    }
                                }
                            );
                        } else {
                            this.isItemsFromResponse = false;
                            this.searchItems = [];
                            for(let c of environment.columns) {
                                if(result.match(/[^\s]+$/).pop() === c.name.substring(0,
                                    result.match(/[^\s]+$/).pop().length).toLowerCase()) {
                                    this.searchItems.push(c.name.toLowerCase() + '=');
                                }
                            }
                            this.isShowDropdown = !!this.searchItems.length;
                        }
                    } else {
                        this.isShowDropdown = false;
                    }
                }
            }
        );
    }

    //changes view mode i.e. 'Simple', 'Graphic'
    onChangeMode(value): void {
        value.checked ? this.viewMode = GRAPHIC_MODE
            : this.viewMode = SIMPLE_MODE;

        this.getRecords(false, true, this.curPageNum, this.viewMode, this.pageCount, this.searchLine,
            this.sortLine);

        this.router.navigate(['/'], { queryParams: { vm: this.viewMode },
            queryParamsHandling: 'merge'});
    }

    //hides dropdown if unfocus
    onFocusInput(): void {
        if(!this.isUnderDropBox) {
            this.isShowDropdown = false;
        }
    }

    //selects item from dropdown
    onSelectItem(id: number): void {
        this.selectedItemId = id;
        this.replacingFunc();
    }

    //handles key pressed events
    onKeyPressed(event): void {
        if(event.keyCode === ARROW_DOWN_KEY) {
            if(this.selectedItemId < this.searchItems.length -1 &&  this.selectedItemId < 9) {
                this.selectedItemId++;
            } else if(this.selectedItemId === -1) {
                this.selectedItemId = 0;
            }
        } else if(event.keyCode === ARROW_UP_KEY) {
            if(this.selectedItemId > 0) {
                this.selectedItemId--;
            } else if(this.selectedItemId === -1) {
                if(this.searchItems.length > 10) {
                    this.selectedItemId = 9;
                }
                else {
                    this.selectedItemId = this.searchItems.length - 1;
                }
            }
        } else if(event.keyCode === ENTER_KEY) {
            if(this.searchItems.length !== 0) {
                this.replacingFunc();
            } else {
                this.onSendSearch();
            }
        }
    }

    //replaces pattern in string with calue from dropbox
    replacingFunc(): void {
        if(this.searchLine !== '') {
            if(this.searchItems[this.selectedItemId].match(/^[^\<]+=/)) {
                if(this.searchLine.match(/[^\s\=]+$/)) {
                    this.searchLine = this.searchLine.replace(/[^\s\=]+$/,
                        this.searchItems[this.selectedItemId].match(/^[^\<]+=*/).pop());
                } else {
                    this.searchLine += this.searchItems[this.selectedItemId]
                        .match(/^[^\<]+=*/).pop();
                }
            } else {
                this.searchLine = this.searchLine.replace(/[^\s\=]+$/, '"' +
                this.searchItems[this.selectedItemId].match(/^[^\<]+=*/).pop() + '" ');
            }
        } else {
            if(this.searchItems[this.selectedItemId].match(/^[^\<]+=*/)) {
                this.searchLine = this.searchItems[this.selectedItemId].match(/^[^\<]+=*/).pop();
            }
        }
        this.searchItems = [];
    }

    //highlight selected item
    isSelected(id: number): boolean {
        return id === this.selectedItemId;
    }

    //sends search request
    onSendSearch(): void {
        console.log(this.sortOrder);
        console.log(this.sortHeader);
        this.curPageNum = 1;
        this.getRecords(false, true, this.curPageNum, this.viewMode, null, this.searchLine,
            this.sortLine);
        this.router.navigate(['/'], { queryParams: { page: this.curPageNum,
            search: this.searchLine}, queryParamsHandling: 'merge'});
        this.isItemsFromResponse = false;
    }

    //sorts table by header
    onSort(value): void {
        if(value.direction === '') {
            this.sortLine = null;
            this.sortOrder = null;
            this.sortHeader = null;
            this.getRecords(false, false, this.curPageNum, this.viewMode, this.pageCount,
                this.searchLine, null);
            this.router.navigate(['/'], { queryParams: { sort: null},
                queryParamsHandling: 'merge' });
        } else {
            this.sortLine = value.active + ':' + value.direction;
            this.sortHeader = value.active;
            this.sortOrder = value.direction;
            this.getRecords(false, false, this.curPageNum, this.viewMode, this.pageCount,
                this.searchLine, value.active + ':' + value.direction);
            this.router.navigate(['/'], { queryParams: { sort:  this.sortLine },
                queryParamsHandling: 'merge' });
        }
    }

    //redirects to page with user information
    onSelectUser(): void {
        this.router.navigate(['/employee'], {queryParams: { uid: this.username} });
    }

    //redirects to login page
    onLogInLogOut(): void {
        if(this.cookieService.get('login')) {
            this.cookieService.delete('login');
        }
        this.router.navigate(['/login']);

    }

    //redirects to page with record information
    onSelect(value): void {
        this.router.navigate(['/employee'], { queryParams: { uid: value.uid } });
    }

    //changes page viewed in table
    onChangePage(value): void {
        if(value.pageSize <= this.pageCount) {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
        this.curPageNum = value.pageIndex+1;
        this.pageCount = value.pageSize;
        this.getRecords(false, false, value.pageIndex+1, this.viewMode, value.pageSize,
            this.searchLine, this.sortLine);
        this.router.navigate(['/'], { queryParams: { page: value.pageIndex + 1,
            pg_num: value.pageSize }, queryParamsHandling: 'merge' });
    }

    //sends getting records requests to back
    getRecords(initializing: boolean, loading: boolean, page: number, vm: string, pg_num: number,
        search: string, sort: string): void {
        this.isLoading = loading;

        if(search){
            search = search.replace(/\+/, encodeURIComponent('+'));
        }

        this.getRecordsParams = {page: page, vm: vm, pg_num: pg_num, search: search, sort: sort};

        this.getRecordsService
        .getRecordsRequest(this.getRecordsParams)
        .subscribe(
            response => {
                if(response.status === STATUS_FAILURE) {
                    if(response.code === 401) {
                        this.router.navigate(['/login']);
                    } else if(response.code === 406) {
                        this.isWrongSearch = true;
                    }
                } else {
                    this.username = this.cookieService.get('login');

                    this.records = response.records;
                    this.recordsLength = response.params.record_count;

                    if(initializing) {
                        this.pageSizeOptions = MAIN_PAGE_SIZES.slice(0);
                        this.pageSizeOptions.push(response.params.record_count);
                    }
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


