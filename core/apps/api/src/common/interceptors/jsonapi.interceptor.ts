import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Serializer } from 'jsonapi-serializer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export const SERIALIZER_KEY = 'jsonapi:serializer';

export function UseSerializer(serializer: Serializer) {
  return (target: any, _key?: string, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      Reflect.defineMetadata(SERIALIZER_KEY, serializer, descriptor.value);
    } else {
      Reflect.defineMetadata(SERIALIZER_KEY, serializer, target);
    }
  };
}

@Injectable()
export class JsonApiInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const serializer =
      this.reflector.get<Serializer>(SERIALIZER_KEY, context.getHandler()) ||
      this.reflector.get<Serializer>(SERIALIZER_KEY, context.getClass());

    return next.handle().pipe(
      map((data) => {
        if (!serializer || !data) {
          return data;
        }

        const toSerialize = this.prepareData(data);
        return (serializer as Serializer).serialize(toSerialize);
      })
    );
  }

  private prepareData(data: any): any {
    if (Array.isArray(data)) {
      return data.map((item) => this.documentToObject(item));
    }
    return this.documentToObject(data);
  }

  private documentToObject(doc: any): any {
    if (!doc) return doc;
    if (typeof doc.toObject === 'function') {
      return doc.toObject();
    }
    if (typeof doc.toJSON === 'function') {
      return doc.toJSON();
    }
    return doc;
  }
}
