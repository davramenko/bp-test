import { IsString } from 'class-validator';

export class LatencyRequestQueryInfo {
    @IsString()
    public host!: string;
}
