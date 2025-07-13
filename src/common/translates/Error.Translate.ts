export function Bad_Request_Exception(messegefa: string, messegeen: string) {
    return {
        status_code: 400,
        message: {
            fa: messegefa,
            en: messegeen,
        },
    };
}

export function Invalid_Input(messegefa: string, messegeen: string) {
    return {
        status_code: 422,
        message: {
            fa: messegefa,
            en: messegeen,
        },
    };
}

export function InternalServerError(messege: string) {
    return {
        status_code: 500,
        code: 1003,
        message: {
            fa: 'خطای سرور',
            en: messege,
        },
    };
}

export const Invalid_Token = {
    status_code: 401,
    code: 1014,
    message: {
        fa: 'توکن نامعتبر است',
        en: 'Invalid Token',
    },
};

export function Data_NotFound(messegefa: string, messegeen: string) {
    return {
        status_code: 409,
        code: 1032,
        message: {
            fa: messegefa,
            en: messegeen,
        },
    };
}
export const DataNotFound = {
    status_code: 409,
    code: 1004,
    message: {
        fa: 'داده پیدا نشد ',
        en: 'Data Not Found',
    },
};

export function Unauthorized(messegefa: string, messegeen: string) {
    return {
        status_code: 401,
        code: 1004,
        message: {
            fa: messegefa,
            en: messegeen,
        },
    };
}

export function NotFound(messegefa: string, messegeen: string) {
    return {
        status_code: 404,
        message: {
            fa: messegefa,
            en: messegeen,
        },
    };
}

export const forbiddenResource = {
    status_code: 403,
    code: 1004,
    message: {
        fa: 'به این مسیر دسترسی ندارید',
        en: 'Forbidden resource',
    },
};

export const Given_Data_Is_Invalid = {
    status_code: 422,
    code: 1021,
    message: {
        fa: 'اطلاعات وارد شده اشتباه است',
        en: 'The given data is invalid.',
    },
};

export const CARD_NUMBER_ALREADY_EXISTS = {
    status_code: 409,
    code: 1022,
    message: {
        fa: 'این شماره کارت قبلاً ثبت شده است.',
        en: 'This card number already exists.',
    },
};

export const Payload_Too_small = {
    status_code: 400,
    type: 'small',
    message: {
        fa: ` اندازه فایل از ${process.env.FILE_MIN_SIZE} بایت کمتر است`,
        en: `The file size is less than ${process.env.FILE_MIN_SIZE} Bytes.`,
    },
};

export function global_error(messegeen: string, status_code: number) {
    return {
        status_code: status_code,
        message: {
            fa: messegeen,
            en: messegeen,
        },
    };
}
