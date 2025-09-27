import { bindings } from 'src/bindings';
import { QuestionService } from 'src/logic/QuestionService';
import { PostQuestionRequest } from 'src/model/api/Question';
import { BadRequestError } from 'src/model/error';
import { LambdaEvent } from 'src/model/Lambda';

let event: LambdaEvent;
let service: QuestionService;

export default async (lambdaEvent: LambdaEvent) => {
  event = lambdaEvent;
  service = bindings.get(QuestionService);

  switch (event.resource) {
    case '/api/question':
      return await authDefault();
  }

  throw new BadRequestError('unexpected resource');
};

const authDefault = async () => {
  switch (event.httpMethod) {
    case 'POST':
      if (event.body === null)
        throw new BadRequestError('body should not be empty');

      return await service.createQuestion(
        JSON.parse(event.body) as PostQuestionRequest
      );
  }

  throw new Error('unexpected httpMethod');
};
