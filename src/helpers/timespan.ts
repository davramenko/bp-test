import ms from "ms";

export async function timespan(time: string | number | any, iat?: number | undefined) : Promise<number> {

    const timestamp = iat || Math.floor(Date.now() / 1000);

    if (typeof time === 'string') {
        const milliseconds = ms(time);
        if (typeof milliseconds === 'undefined') {
            return 0;
        }
        return Math.floor(timestamp + milliseconds / 1000);
    } else if (typeof time === 'number') {
        return timestamp + time;
    } else {
        return 0;
    }
}