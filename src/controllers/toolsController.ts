import express from 'express';
import { BadRequest } from 'http-errors';
import ping from 'ping';
import axios from 'axios';
import { LatencyRequestQuery } from '../interfaces/request/query/LatencyRequestQuery';

// https://www.npmjs.com/package/axios
export async function latency(req: express.Request, res: express.Response, _next: express.NextFunction): Promise<any> {
    const reqQuery: LatencyRequestQuery = req.query as any;
    if (!reqQuery.host) {
        throw new BadRequest('Host name is undefined');
    }
    const ts = new Date().getTime();
    // @ts-ignore
    const getRes = await axios.get(`https://${reqQuery.host}`);
    res.json({
        status: 'SUCCESS',
        responseTime: new Date().getTime() - ts,
    });
}

// Extra method
export async function icmpPing(req: express.Request, res: express.Response, _next: express.NextFunction): Promise<any> {
    const reqQuery: LatencyRequestQuery = req.query as any;
    if (!reqQuery.host) {
        throw new BadRequest('Host name is undefined');
    }
    const pingRes = await ping.promise.probe(reqQuery.host, {
        timeout: 10,
    });
    res.json(pingRes);
}
