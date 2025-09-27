import { inject, injectable } from 'inversify';
import { QuestionAccess } from 'src/dao/QuestionAccess';
import { PostQuestionRequest } from 'src/model/api/Question';
import { QuestionEntity } from 'src/model/entity/QuestionEntity';
import { randomBase36 } from 'src/utils/random';

/**
 * Service class for User
 */
@injectable()
export class QuestionService {
  @inject(QuestionAccess)
  private readonly questionAccess!: QuestionAccess;

  public async createQuestion(data: PostQuestionRequest) {
    let uid = '';
    let digit = 5;
    let exists = true;
    while (exists) {
      uid = randomBase36(digit);
      const found = await this.questionAccess.findOne({ where: { uid } });
      exists = found !== null;
      if (exists) digit++;
    }

    const questionEntity = new QuestionEntity();
    questionEntity.uid = uid;
    questionEntity.content = data.content;
    questionEntity.isFreeResponse = data.isFreeResponse;
    questionEntity.discussionUrl = data.discussionUrl;

    return await this.questionAccess.save(questionEntity);
  }
}
