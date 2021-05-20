import { validate, ValidationError } from 'class-validator';
import * as express from 'express';
import { ClassConstructor, plainToClass } from 'class-transformer';

export interface ErrorBagEntry {
    param: string;
    error: string;
}

function extractErrorMessage(error: ValidationError, parentProperty?: string): ErrorBagEntry[] {
    let propertyName: string;

    if (parentProperty) {
        propertyName = `${parentProperty}.${error.property}`;
    } else {
        propertyName = error.property;
    }

    let bag: { param: string; error: string }[] = [];

    if (error.children && error.children.length !== 0) {
        for (let i = 0; i < error.children.length; i++) {
            const childError = error.children[i];

            bag = bag.concat(extractErrorMessage(childError, propertyName));
        }
    }

    if (error.constraints) {
        const validationErrors = error.constraints;

        const validationErrorsKeys = Object.keys(validationErrors);

        bag.push({
            param: propertyName,
            error: validationErrors[validationErrorsKeys[0]],
        });
    }

    return bag;
}

export function validateRequest(
    bodyValidationSchema: ClassConstructor<any> | null,
    additionalValidationSchemas: { [key: string]: ClassConstructor<any> } = {},
): (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<any> {
    return async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<any> => {
        const allValidationSchemas = additionalValidationSchemas;

        if (bodyValidationSchema) {
            allValidationSchemas.body = bodyValidationSchema;
        }

        const requestFieldsToValidate = Object.keys(allValidationSchemas);

        let validationErrors: ValidationError[] = [];

        for (let i = 0; i < requestFieldsToValidate.length; i++) {
            const transformedObject = plainToClass(
                allValidationSchemas[requestFieldsToValidate[i]],
                // @ts-ignore
                req[requestFieldsToValidate[i]],
            );

            // @ts-ignore
            req[requestFieldsToValidate[i]] = transformedObject;

            validationErrors = validationErrors.concat(
                await validate(transformedObject, {
                    validationError: {
                        target: false,
                    },
                    whitelist: true,
                }),
            );
        }

        if (validationErrors.length === 0) {
            return next();
        }

        let bag: ErrorBagEntry[] = [];

        for (let i = 0; i < validationErrors.length; i++) {
            bag = bag.concat(extractErrorMessage(validationErrors[i]));
        }

        return res.status(422).json({
            validationErrors: bag,
        });
    };
}
