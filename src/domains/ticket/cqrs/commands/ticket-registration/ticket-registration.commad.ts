export class TicketRegistrationCommand {
    constructor(req: any, body: any, file:any) {
        this.req = req;
        this.body = body;
        this.file = file;
    }
    req: any;
    body: any;
    file: any;
}
