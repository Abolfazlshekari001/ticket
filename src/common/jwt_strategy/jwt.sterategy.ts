import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            /*AuthHeaderAsBearerToken تنظیم استخراج توکن از*/
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            /**چک کردن تاریخ انقضای توکن
       false : چک میکند
       true : چک نمیکند
       **/
            ignoreExpiration: false,
            /* jwt کلید امضای  */
            secretOrKey: process.env.JWT_SECRET,
        });
    }

    /*تابع تایید توکن و استخراج اطلاعات درون توکن(وجود الزامی) */
    async validate(payload: any) {
        return {
            audience: payload.aud,
            section: payload.section,
        };
    }
}
