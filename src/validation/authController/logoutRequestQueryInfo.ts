import { IsOptional, IsString, Matches } from 'class-validator';

export class LogoutRequestQueryInfo {
    @IsString()
    @Matches(/^(?:true|false)+$/i)
    @IsOptional()
    public all!: string;
}
