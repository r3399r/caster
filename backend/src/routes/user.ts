import { bindings } from 'src/bindings';
import { UserService } from 'src/logic/UserService';
import { BadRequestError } from 'src/model/error';
import { LambdaEvent } from 'src/model/Lambda';

let event: LambdaEvent;
let service: UserService;

export default async (lambdaEvent: LambdaEvent) => {
  event = lambdaEvent;
  service = bindings.get(UserService);

  switch (event.resource) {
    case '/api/user':
      return await userDefault();
  }

  throw new BadRequestError('unexpected resource');
};

const userDefault = async () => {
  switch (event.httpMethod) {
    case 'GET':
      return await service.getUser();
  }

  throw new Error('unexpected httpMethod');
};
