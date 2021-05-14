import {IsString} from "class-validator";

export class latencyRequestQueryInfo {
    @IsString()
    host!: string;
}