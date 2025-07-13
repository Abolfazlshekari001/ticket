export class GetTicketsForUserQuery {
    constructor(req: any, userId: any) {
        this.req = req;
        this.userId = userId;
    }
    req: any;
    userId: any;
}
