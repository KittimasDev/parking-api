interface HttpStatusInterface {
    statusCode: number;
    message: string;
}
const HTTP_STATUS: Record<string, HttpStatusInterface> = {
    OK: { statusCode: 200, message: 'Successfully' },
    CREATED: { statusCode: 201, message: 'Created' },
    NO_CONTENT: { statusCode: 204, message: 'No content' },
    CONFLICT: { statusCode: 409, message: 'Conflict' },
    FORBIDDEN: { statusCode: 403, message: 'Forbidden' },
    NOT_ACCEPTABLE: { statusCode: 406, message: 'Not acceptable' },
    NOT_FOUND: { statusCode: 404, message: 'Not found' },
    BAD_REQUEST: { statusCode: 500, message: 'Bad request' },
    UNAUTHORIZED: { statusCode: 401, message: 'Unauthorized' },
    INTERNAL_SERVER_ERROR: { statusCode: 500, message: 'Internal Server Error' },
    ERROR: { statusCode: 400, message: 'Error' },
};

export { HTTP_STATUS, HttpStatusInterface };

