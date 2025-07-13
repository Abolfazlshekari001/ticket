export class getAllTicketQuery {
    constructor(req: any, agentId: string) {
        this.req = req;
        this.agentId = agentId;
    }
    req: any;
    agentId: string;
}
