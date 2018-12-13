export class Response {
    status: number;
    fields: any;
    records: any;
    params: {
        record_count: number;
    };
    message: string;
    code: number;
    is_edit: number;
}