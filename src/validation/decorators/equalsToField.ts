import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function EqualsToField(property: string, validationOptions?: ValidationOptions): any {
    return function validator(object: Record<string, any>, propertyName: string): void {
        registerDecorator({
            name: 'equalsToField',
            target: object.constructor,
            propertyName,
            constraints: [property],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments): boolean {
                    const [relatedPropertyName] = args.constraints;
                    const relatedValue = (args.object as any)[relatedPropertyName];
                    return value === relatedValue;
                },
                defaultMessage(validationArguments: ValidationArguments): string {
                    const [relatedPropertyName] = validationArguments.constraints;
                    return `Should be equal to property ${relatedPropertyName}`;
                },
            },
        });
    };
}
