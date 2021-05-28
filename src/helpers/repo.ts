import { EntityTarget, getRepository as typeormGetRepository, Repository } from 'typeorm';
import { dbConfig } from '../configs/appConfig';

export function getRepository<T>(entity: EntityTarget<T>): Repository<T> {
    return typeormGetRepository(entity, dbConfig.connectionName);
}
