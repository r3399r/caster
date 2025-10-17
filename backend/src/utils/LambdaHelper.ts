import { bindings } from 'src/bindings';
import { HttpError } from 'src/model/error/HttpError';
import { LambdaEvent, LambdaOutput } from 'src/model/Lambda';

export const deviceIdSymbol = Symbol('deviceId');
export const userIdSymbol = Symbol('userId');

export const successOutput = <T>(res: T): LambdaOutput => ({
  statusCode: 200,
  headers: {
    'Access-Control-Allow-Origin': '*', // Required for CORS support to work,
  },
  body: typeof res === 'string' ? res : JSON.stringify(res),
});

export const errorOutput = (e: unknown): LambdaOutput => {
  const error: HttpError = e as HttpError;

  return {
    statusCode: error.status ?? 500,
    headers: {
      'Access-Control-Allow-Origin': '*', // Required for CORS support to work
    },
    body: JSON.stringify({
      status: error.status,
      name: error.name,
      message: error.message,
      code: error.code,
    }),
  };
};

export const initLambda = (event?: LambdaEvent): void => {
  bind<string>(deviceIdSymbol, event?.headers?.['x-device-id'] ?? 'xx');
  bind<string>(userIdSymbol, event?.headers?.['x-user-id'] ?? 'xx');
};

const bind = <T>(bindingId: symbol, values: T): void => {
  if (bindings.isBound(bindingId) === false)
    bindings.bind<T>(bindingId).toConstantValue(values);
  else bindings.rebindSync<T>(bindingId).toConstantValue(values);
};
