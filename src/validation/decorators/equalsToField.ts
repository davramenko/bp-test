import {registerDecorator, ValidationArguments, ValidationOptions} from "class-validator";

export function EqualsToField(property: string, validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'equalsToField',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [property],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const [relatedPropertyName] = args.constraints;
                    const relatedValue = (args.object as any)[relatedPropertyName];
                    return value === relatedValue;
                },
                defaultMessage(validationArguments: ValidationArguments): string {
                    const [relatedPropertyName] = validationArguments.constraints;

                    return `Should be equal to property ${relatedPropertyName}`;
                }
            },
        });
    };
}