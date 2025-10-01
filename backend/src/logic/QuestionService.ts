import { inject, injectable } from 'inversify';
import { LIMIT, OFFSET } from 'src/constant/Pagination';
import { CategoryAccess } from 'src/dao/CategoryAccess';
import { QuestionAccess } from 'src/dao/QuestionAccess';
import { QuestionMinorAccess } from 'src/dao/QuestionMinorAccess';
import { ReplyAccess } from 'src/dao/ReplyAccess';
import {
  GetQuestionParams,
  GetQuestionResponse,
  PostQuestionReplyRequest,
  PostQuestionRequest,
} from 'src/model/api/Question';
import { QuestionEntity } from 'src/model/entity/QuestionEntity';
import { QuestionMinorEntity } from 'src/model/entity/QuestionMinorEntity';
import { ReplyEntity } from 'src/model/entity/ReplyEntity';
import { BadRequestError } from 'src/model/error';
import { genPagination } from 'src/utils/paginator';
import { randomBase36 } from 'src/utils/random';
import { UserService } from './UserService';

/**
 * Service class for Question
 */
@injectable()
export class QuestionService {
  @inject(QuestionAccess)
  private readonly questionAccess!: QuestionAccess;
  @inject(QuestionMinorAccess)
  private readonly questionMinorAccess!: QuestionMinorAccess;
  @inject(UserService)
  private readonly userService!: UserService;
  @inject(ReplyAccess)
  private readonly replyAccess!: ReplyAccess;
  @inject(CategoryAccess)
  private readonly categoryAccess!: CategoryAccess;

  public async getQuestionList(
    params: GetQuestionParams | null
  ): Promise<GetQuestionResponse> {
    const limit = params?.limit ? Number(params.limit) : LIMIT;
    const offset = params?.offset ? Number(params.offset) : OFFSET;
    const [question, total] = await this.questionAccess.findAndCount({
      take: limit,
      skip: offset,
    });

    return {
      data: question.map((v) => ({
        ...v,
        uid: v.rid + v.id.toString(36),
      })),
      paginate: genPagination(total, limit, offset),
    };
  }

  public async createQuestion(data: PostQuestionRequest) {
    const category = await this.categoryAccess.findOneOrFail({
      where: { name: data.categoryName },
    });

    const questionEntity = new QuestionEntity();
    questionEntity.rid = randomBase36(3);
    questionEntity.categoryId = category.id;
    questionEntity.content = data.content;
    questionEntity.discussionUrl = data.discussionUrl;

    const newQuestionEntity = await this.questionAccess.save(questionEntity);

    const minor: QuestionMinorEntity[] = [];
    for (const m of data.minor) {
      const questionMinorEntity = new QuestionMinorEntity();
      questionMinorEntity.questionId = newQuestionEntity.id;
      questionMinorEntity.type = m.type;
      questionMinorEntity.orderIndex = m.orderIndex;
      questionMinorEntity.options = m.options;
      questionMinorEntity.answer = m.answer;

      const minorEntity =
        await this.questionMinorAccess.save(questionMinorEntity);
      minor.push(minorEntity);
    }

    return {
      ...newQuestionEntity,
      minor,
    };
  }

  public async replyQuestion(data: PostQuestionReplyRequest) {
    if (!data.userId && !data.deviceId)
      throw new BadRequestError('Either userId or deviceId must be provided');

    let userId: number;
    if (data.userId) userId = data.userId;
    else {
      const user = await this.userService.getUserByDeviceId(
        data.deviceId ?? ''
      );
      userId = user.id;
    }

    const replyEntity = new ReplyEntity();
    replyEntity.questionId = data.questionId;
    replyEntity.userId = userId;
    replyEntity.score = data.score;
    replyEntity.elapsedTimeMs = data.elapsedTimeMs;
    replyEntity.repliedAnswer = data.repliedAnswer;

    return await this.replyAccess.save(replyEntity);
  }
}
