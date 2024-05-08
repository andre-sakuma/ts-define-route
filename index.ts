type RemoveTail<
  S extends string,
  Tail extends string
> = S extends `${infer P}${Tail}` ? P : S

type GetFirstRouteParameter<S extends string> = RemoveTail<S, `/${string}`>

export type RouteParams<Route extends string> =
  Route extends `${string}:${infer Rest}`
    ? (GetFirstRouteParameter<Rest> extends never
        ? {}
        : { [key in GetFirstRouteParameter<Rest>]: string }) &
        (Rest extends `${GetFirstRouteParameter<Rest>}${infer Next}`
          ? RouteParams<Next>
          : unknown)
    : {}

type params = RouteParams<'/users/:userId/:name/:age'>

type Something<SomethingBefore extends string> =
  SomethingBefore extends `${string}:${infer Rest}` ? Rest : never

type Rest = Something<'/users/:userId/:name/:age'>
type Param1 = GetFirstRouteParameter<Rest>

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE'] as const
type HttpMethod = (typeof HTTP_METHODS)[number]

const typeDefinitions = [
  'string',
  'string[]',
  'number',
  'boolean',
  'number[]',
] as const
type TypeDefinition = (typeof typeDefinitions)[number]
type GetTypeFromDefinition<T extends TypeDefinition> = T extends 'string'
  ? string
  : T extends 'string[]'
  ? string[]
  : T extends 'number'
  ? number
  : T extends 'number[]'
  ? number[]
  : T extends 'boolean'
  ? boolean
  : never

type GetFieldType<T extends FieldType | TypeDefinition> =
  T extends TypeDefinition
    ? GetTypeFromDefinition<T>
    : T extends FieldType
    ? ObjectDefinitionType<T>
    : never

type FieldType = {
  [key in string]: TypeDefinition | FieldType
}
type ObjectDefinitionType<TSchema extends FieldType> = {
  [key in keyof TSchema]: GetFieldType<TSchema[key]>
}

type HasBody<TMethod extends HttpMethod> = TMethod extends 'POST' | 'PUT'
  ? true
  : false

type GetRequestBody<
  TMethod extends HttpMethod,
  T extends FieldType
> = HasBody<TMethod> extends true ? ObjectDefinitionType<T> : never

type ResponseBody<T extends FieldType | void> = T extends FieldType
  ? ObjectDefinitionType<T>
  : void

type Context<RouteParams = {}, QueryParams = {}, RequestBody = {}> = {
  params: RouteParams
  query: QueryParams
  body: RequestBody
}

function defineRoute<
  TMethod extends HttpMethod,
  TPath extends string,
  TQuery extends FieldType,
  TResponse extends FieldType,
  TBody extends FieldType
>(
  method: TMethod,
  path: TPath,
  schema: {
    query: TQuery
    params: RouteParams<TPath>
    response: TResponse
    body: HasBody<TMethod> extends true ? TBody : never
  },
  handler: (
    context: Context<
      RouteParams<TPath>,
      ObjectDefinitionType<TQuery>,
      GetRequestBody<TMethod, TBody>
    >
  ) => ResponseBody<TResponse>
) {
  return {
    path,
    method,
    handler,
    schema,
  }
}

type test = ObjectDefinitionType<{
  name: 'string'
  age: 'number'
  roles: 'string[]'
  location: {
    city: 'string'
    country: 'string'
  }
}>

const route = defineRoute(
  'POST',
  '/users/:userId',
  {
    query: {},
    params: {
      userId: 'string',
    },
    response: {
      id: 'string',
    },
    body: {
      name: 'string',
      age: 'number',
      roles: 'string[]',
      location: {
        city: 'string',
        country: 'string',
      },
    },
  },
  (context) => {
    const query = context.query
    const params = context.params
    const body = context.body
    const location = body.location
    const city = location.city
    const roles = body.roles

    return {
      id: '123',
    }
  }
)
