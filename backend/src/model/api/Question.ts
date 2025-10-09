import { Question } from 'src/model/entity/QuestionEntity';
import { QuestionMinor } from 'src/model/entity/QuestionMinorEntity';
import { Reply } from 'src/model/entity/ReplyEntity';
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
  id: number;
  userId?: number;
  deviceId?: string;
  elapsedTimeMs: number;
  replied: { id: number; answer: string }[];
};

export type PostQuestionReplyResponse = Reply;

export type GetQuestionParams = PaginationParams;

export type ModifiedQuestion = Question & { uid: string };

export type GetQuestionResponse = Paginate<ModifiedQuestion>;

export type GetQuestionIdResponse = Omit<Question, 'minor'> & {
  minor: Omit<QuestionMinor, 'answer'>[];
};
