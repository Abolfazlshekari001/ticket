import { sectionTypeEnum } from 'src/domains/system/entity/enum/sectionType.emun';

export class GetAllDepartemantQuery {
    constructor(req: any, sectionType: sectionTypeEnum) {
        this.req = req;
        this.sectionType = sectionType;
    }
    req: any;
    sectionType: sectionTypeEnum;
}
