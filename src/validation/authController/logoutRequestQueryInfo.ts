import {IsOptional, IsString, Matches} from "class-validator";

export class logoutRequestQueryInfo {
    @IsString()
    @Matches(/^(?:true|false)+$/i)
    @IsOptional()
    all!: string;
}