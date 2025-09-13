export const Request_Was_Successful = {
    status_code: 201,
    code: 5000,
    message: {
        fa: 'عملیات با موفقیت اجرا شد',
        en: 'The request was successful',
    },
};

export function Request_Was_Successful1(additional_info: object | string | number) {
    return {
        status_code: 201,
        code: 5000,
        message: {
            fa: 'عملیات با موفقیت اجرا شد',
            en: 'The request was successful',
            additional_info: [additional_info],
        },
    };
}

export const Request_Was_Successful2 = {
    status_code: 201,
    code: 5000,
    message: {
        fa: 'اطلاعات با موفقیت ثبت شد و در انتظار تایید ',
        en: 'Information has been successfully registered and is awaiting confirmation  ',
    },
};
