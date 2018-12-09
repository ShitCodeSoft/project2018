export class Response {
    status: number;
    columns: {
        name: number;
        shortcut: string;
    };
    records: any;
    params: {
        record_count: number;
    };
    message: string;
    code: number;
}