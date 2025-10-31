import { inject, injectable } from 'inversify';
import { v4 as uuidv4 } from 'uuid';
import { LIMIT, OFFSET } from 'src/constant/Pagination';
import { ReplyAccess } from 'src/dao/ReplyAccess';
import { UserAccess } from 'src/dao/UserAccess';
import { UserStatsAccess } from 'src/dao/UserStatsAccess';
import {
  GetUserDetailParams,
  GetUserDetailResponse,
  GetUserResponse,
  PatchUserBindRequest,
  PatchUserBindResponse,
  PostUserBindRequest,
  PostUserUnbindResponse,
} from 'src/model/api/User';
import { UserEntity } from 'src/model/entity/UserEntity';
import { BadRequestError, ConflictError, NotFoundError } from 'src/model/error';
import { deviceIdSymbol, userIdSymbol } from 'src/utils/LambdaHelper';
import { genPagination } from 'src/utils/paginator';
import { randomBase10 } from 'src/utils/random';

/**
 * Service class for User
 */
@injectable()
export class UserService {
  @inject(UserAccess)
  private readonly userAccess!: UserAccess;
  @inject(UserStatsAccess)
  private readonly userStatsAccess!: UserStatsAccess;
  @inject(ReplyAccess)
  private readonly replyAccess!: ReplyAccess;
  @inject(deviceIdSymbol)
  private readonly deviceId!: string;
  @inject(userIdSymbol)
  private readonly userId!: string;

  public async createUserWithDeviceId() {
    const userEntity = new UserEntity();
    userEntity.deviceId = this.deviceId;

    return await this.userAccess.save(userEntity);
  }

  public async getUser(): Promise<GetUserResponse> {
    const user = await this.userAccess.findOne({
      where: { id: isNaN(Number(this.userId)) ? 0 : Number(this.userId) },
    });
    if (user !== null) return user;

    return await this.userAccess.findOne({
      where: { deviceId: this.deviceId },
    });
  }

  public async getUserDetail(
    params: GetUserDetailParams | null
  ): Promise<GetUserDetailResponse> {
    if (!params?.categoryId)
      throw new BadRequestError('categoryId is required');

    const userStats = await this.userStatsAccess.findOne({
      where: {
        userId: isNaN(Number(this.userId)) ? 0 : Number(this.userId),
        categoryId: params.categoryId,
      },
      relations: { user: true },
    });

    const limit = params?.limit ? Number(params.limit) : LIMIT;
    const offset = params?.offset ? Number(params.offset) : OFFSET;
    const [reply, total] = await this.replyAccess.findAndCount({
      where: {
        userId: isNaN(Number(this.userId)) ? 0 : Number(this.userId),
        question: {
          categoryId: params.categoryId,
        },
      },
      relations: {
        question: { tag: true },
      },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      user: userStats?.user ?? null,
      categoryId: params.categoryId,
      count: userStats?.count ?? null,
      scoringRate: userStats?.scoringRate ?? null,
      reply: {
        data: reply.map((v) => ({
          id: v.id,
          questionUid: v.question.rid + v.question.id.toString(36),
          questionTitle: v.question.title,
          tag: v.question.tag,
          score: v.score,
          elapsedTimeMs: v.elapsedTimeMs,
          repliedAnswer: v.repliedAnswer,
          createdAt: v.createdAt,
        })),
        paginate: genPagination(total, limit, offset),
      },
    };
  }

  public async bindUser(data: PostUserBindRequest) {
    const user = await this.getUser();
    const userByEmail = await this.userAccess.findOne({
      where: { email: data.email, isVerified: true },
    });
    if (user === null) {
      if (userByEmail === null) {
        const userEntity = new UserEntity();
        userEntity.deviceId = this.deviceId;
        userEntity.email = data.email;
        userEntity.code = randomBase10(6);
        userEntity.codeGeneratedAt = new Date().toISOString();
        await this.userAccess.save(userEntity);

        return;
      }

      userByEmail.code = randomBase10(6);
      userByEmail.codeGeneratedAt = new Date().toISOString();
      await this.userAccess.save(userByEmail);

      return;
    }

    if (user.isVerified) throw new ConflictError('you are already verified.');
    if (userByEmail === null) {
      // clean user with same email to avoid db conflict
      const unverifiedUserByEmail = await this.userAccess.findOne({
        where: { email: data.email, isVerified: false },
      });
      if (
        unverifiedUserByEmail !== null &&
        unverifiedUserByEmail.id !== user.id
      ) {
        unverifiedUserByEmail.email = null;
        await this.userAccess.save(unverifiedUserByEmail);
      }

      user.email = data.email;
      user.code = randomBase10(6);
      user.codeGeneratedAt = new Date().toISOString();
      await this.userAccess.save(user);

      return;
    }

    userByEmail.code = randomBase10(6);
    userByEmail.codeGeneratedAt = new Date().toISOString();
    await this.userAccess.save(userByEmail);

    return;
  }

  public async verifyUser(
    data: PatchUserBindRequest
  ): Promise<PatchUserBindResponse> {
    const user = await this.userAccess.findOne({
      where: { email: data.email, code: data.code },
    });
    const thisUser = await this.getUser();
    if (user === null) throw new NotFoundError('data not found');

    if (thisUser !== null) {
      if (thisUser.isVerified)
        throw new ConflictError('you are already verified.');
      if (user.id !== thisUser.id) {
        const replies = await this.replyAccess.find({
          where: { userId: thisUser.id },
        });
        await this.replyAccess.saveMany(
          replies.map((r) => ({ ...r, userId: user.id }))
        );
        // may need to delete thisUser in time, or housekeep by loader
      }
    }

    user.isVerified = true;
    user.verifiedAt = new Date().toISOString();

    return await this.userAccess.save(user);
  }

  public async unbindUser(): Promise<PostUserUnbindResponse> {
    const user = await this.getUser();
    if (user === null) throw new NotFoundError('user not found');
    if (user.isVerified === false)
      throw new BadRequestError('you are not verified.');

    const userEntity = new UserEntity();
    userEntity.deviceId = uuidv4();

    return await this.userAccess.save(userEntity);
  }
}
