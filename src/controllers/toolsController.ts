import express from 'express';
import {BadRequest} from 'http-errors';
import {LatencyRequestQuery} from "../interfaces/request/query/LatencyRequestQuery";
import ping from 'ping';
import axios from "axios";

// https://www.npmjs.com/package/axios
export async function latency(req: express.Request, res: express.Response, next: express.NextFunction) {
    const reqQuery: LatencyRequestQuery = req.query as any;
    if (!reqQuery.host) {
        throw new BadRequest('Host name is undefined');
    }
    const ts = (new Date()).getTime();
    const getRes = await axios.get('https://' + reqQuery.host);
    //console.log(getRes);
    res.json({
        status: "SUCCESS",
        responseTime: (new Date()).getTime() - ts,
    });
}

export async function icmpPing(req: express.Request, res: express.Response, next: express.NextFunction) {
    const reqQuery: LatencyRequestQuery = req.query as any;
    if (!reqQuery.host) {
        throw new BadRequest('Host name is undefined');
    }
    let pingRes = await ping.promise.probe(reqQuery.host, {
        timeout: 10,
    });
    res.json(pingRes);
}
