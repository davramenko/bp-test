import {IsString, Length, Matches, MinLength} from "class-validator";
import {EqualsToField} from "../decorators/equalsToField";

export class registrationRequestBodyInfo {
    @IsString()
    userIdentifier!: string;

    @IsString()
    @MinLength(8)
    @Matches(/^[0-9A-Za-z]+$/)
    password!: string;

    @IsString()
    @EqualsToField('password')
    passwordConfirmation!: string;
}