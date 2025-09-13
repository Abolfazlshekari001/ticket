export class GetSubSystemsToSystemQuery {
    constructor(req: any, referenceId: string) {
        this.req = req;
        this.referenceId = referenceId;
    }
    req: any;
    referenceId: string;
}
