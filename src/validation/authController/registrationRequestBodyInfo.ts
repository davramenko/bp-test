import { IsString, Matches, MinLength } from 'class-validator';
import { EqualsToField } from '../decorators/equalsToField';

export class RegistrationRequestBodyInfo {
    @IsString()
    public userIdentifier!: string;

    @IsString()
    @MinLength(8)
    @Matches(/^[0-9A-Za-z]+$/)
    public password!: string;

    @IsString()
    @EqualsToField('password')
    public passwordConfirmation!: string;
}
