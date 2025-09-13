export class DeleteSubSystemsToSystemCommand {
    constructor(req: any, subsystemId: string) {
        this.req = req;
        this.subsystemId = subsystemId;
    }
    req: any;
    subsystemId: string;
}
