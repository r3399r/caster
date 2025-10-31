import { bindings } from 'src/bindings';
import { UserService } from 'src/logic/UserService';
import {
  GetUserDetailParams,
  PatchUserBindRequest,
  PostUserBindRequest,
} from 'src/model/api/User';
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
    case '/api/user/detail':
      return await userDetail();
    case '/api/user/bind':
      return await userBind();
    case '/api/user/unbind':
      return await userUnbind();
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

const userDetail = async () => {
  switch (event.httpMethod) {
    case 'GET':
      return await service.getUserDetail(
        event.queryStringParameters as GetUserDetailParams | null
      );
  }

  throw new Error('unexpected httpMethod');
};

const userBind = async () => {
  switch (event.httpMethod) {
    case 'POST':
      if (event.body === null)
        throw new BadRequestError('body should not be empty');

      return await service.bindUser(
        JSON.parse(event.body) as PostUserBindRequest
      );
    case 'PATCH':
      if (event.body === null)
        throw new BadRequestError('body should not be empty');

      return await service.verifyUser(
        JSON.parse(event.body) as PatchUserBindRequest
      );
  }

  throw new Error('unexpected httpMethod');
};

const userUnbind = async () => {
  switch (event.httpMethod) {
    case 'PATCH':
      return await service.unbindUser();
  }

  throw new Error('unexpected httpMethod');
};
