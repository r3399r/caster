import { Question } from 'src/model/entity/QuestionEntity';
import { Paginate, PaginationParams } from 'src/model/Pagination';

export type PostQuestionRequest = {
  categoryName: string;
  content: string;
  discussionUrl: string;
  minor: {
    type: 'SINGLE' | 'MULTIPLE';
    orderIndex: number;
    content?: string;
    options: string;
    answer: string;
  }[];
};

export type PostQuestionReplyRequest = {
  questionId: number;
  userId?: number;
  deviceId?: string;
  score: number;
  elapsedTimeMs: number;
  repliedAnswer: string;
};

export type GetQuestionParams = PaginationParams;

export type ModifiedQuestion = Question & { uid: string };

export type GetQuestionResponse = Paginate<ModifiedQuestion>;

export type GetQuestionIdResponse = Question;
