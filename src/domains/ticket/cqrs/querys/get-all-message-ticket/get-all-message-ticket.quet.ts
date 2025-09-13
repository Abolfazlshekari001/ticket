export class GetAllMessageForTicketQuery {
    constructor(req: any, ticketId: any, id: string) {
        this.req = req;
        this.ticketId = ticketId;
        this.id = id;
    }
    req: any;
    ticketId: any;
    id: string;
}
