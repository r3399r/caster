import { inject, injectable } from 'inversify';
import { QuestionAccess } from 'src/dao/QuestionAccess';
import { ReplyAccess } from 'src/dao/ReplyAccess';
import { UserStatsAccess } from 'src/dao/UserStatsAccess';
import { UserStatsEntity } from 'src/model/entity/UserStatsEntity';

/**
 * Service class for Stats
 */
@injectable()
export class StatsService {
  @inject(ReplyAccess)
  private readonly replyAccess!: ReplyAccess;
  @inject(QuestionAccess)
  private readonly questionAccess!: QuestionAccess;
  @inject(UserStatsAccess)
  private readonly userStatsAccess!: UserStatsAccess;

  public async processStats() {
    const replies = await this.replyAccess.find();

    const questionStats = await this.replyAccess.groupByQuestionId(
      replies.map((r) => r.questionId)
    );
    console.log(`Processing stats for ${questionStats.length} questions.`);
    for (const stats of questionStats) {
      console.log(JSON.stringify(stats));
      const q = await this.questionAccess.findOneOrFail({
        where: { id: stats.questionId },
      });
      await this.questionAccess.save({
        ...q,
        count: Number(stats.count),
        scoringRate: Number(stats.scoringRate),
        avgElapsedTimeMs: Number(stats.avgElapsedTimeMs),
      });
    }

    const userStats = await this.replyAccess.groupByUserId(
      replies.map((r) => r.userId)
    );
    console.log(`Processing stats for ${userStats.length} users.`);
    for (const stats of userStats) {
      console.log(JSON.stringify(stats));
      const us = await this.userStatsAccess.findOne({
        where: { userId: stats.userId, categoryId: stats.categoryId },
      });
      if (us !== null)
        await this.userStatsAccess.save({
          ...us,
          count: Number(stats.count),
          scoringRate: Number(stats.scoringRate),
        });
      else {
        const usEntity = new UserStatsEntity();
        usEntity.userId = stats.userId;
        usEntity.categoryId = stats.categoryId;
        usEntity.count = Number(stats.count);
        usEntity.scoringRate = Number(stats.scoringRate);
        await this.userStatsAccess.save(usEntity);
      }
    }
  }
}
