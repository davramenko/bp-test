declare namespace Express {
    export interface Request {
        user: {
            id: number;
            userIdentifier: string;
        };
        sesId: string;
    }
}
