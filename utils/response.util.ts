// src/utils/response.util.ts

import { HttpStatusInterface } from './httpStatus';

export type ResponseFormat<T> = {
    statusCode: number;
    message: string;
    timestamp?: string;
    isSuspect?: boolean;
    body?: T;
    page_information?: pageInformation;
};

export type pageInformation = {
    count: number;
    size: number;
    total: number;
    page: number;
    total_page: number;
    next_page: boolean;
    prev_page: boolean;
    order_field: string;
    order_type: string;
};

export function createResponse<T>(
    httpStatus: HttpStatusInterface,
    body: T,
    page_information?: pageInformation,
    times: boolean = false,
): ResponseFormat<T> {
    return {
        statusCode: httpStatus['statusCode'],
        message: httpStatus['message'],
        timestamp: times ? new Date().toISOString() : undefined,
        body,
        page_information,
    };
}
export function createFindResponse<T>(
    httpStatus: HttpStatusInterface,
    body: T,
    page_information: pageInformation,
    times: boolean = false,
): ResponseFormat<T> {
    return {
        statusCode: httpStatus['statusCode'],
        message: httpStatus['message'],
        timestamp: times ? new Date().toISOString() : undefined,
        body,
        page_information,
    };
}
export function createResponseKiosk<T>(
    httpStatus: HttpStatusInterface,
    message: string,
    IsSuspect: boolean,
): ResponseFormat<T> {
    return {
        statusCode: httpStatus['statusCode'],
        message: message,
        isSuspect: IsSuspect,
    };
}
