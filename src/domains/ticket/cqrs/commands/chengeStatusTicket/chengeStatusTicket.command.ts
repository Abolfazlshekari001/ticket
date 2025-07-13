export class ChengeStatusTicketCommand {
    constructor(req: any, ticketId: string) {
        this.req = req;
        this.ticketId = ticketId
    }
    req: any;
    ticketId: string
}