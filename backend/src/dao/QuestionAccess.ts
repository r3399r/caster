import { inject, injectable } from 'inversify';
import { FindOneOptions } from 'typeorm';
import { Question, QuestionEntity } from 'src/model/entity/QuestionEntity';
import { Database } from 'src/utils/Database';

/**
 * Access class for Question model.
 */
@injectable()
export class QuestionAccess {
  @inject(Database)
  private readonly database!: Database;

  public async save(data: Question) {
    const qr = await this.database.getQueryRunner();
    const entity = new QuestionEntity();
    Object.assign(entity, data);

    return await qr.manager.save(entity);
  }

  public async findOne(options?: FindOneOptions<Question>) {
    const qr = await this.database.getQueryRunner();

    return await qr.manager.findOne<Question>(QuestionEntity.name, {
      ...options,
    });
  }
}
