export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: unknown; output: unknown; }
};

/** Response body for the hello GraphQL query. */
export type HelloGql = {
  __typename?: 'HelloGql';
  id: Scalars['String']['output'];
  message: Scalars['String']['output'];
  timestamp: Scalars['Int']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  todoCreate: Todo;
  todoDelete: Todo;
  todoDeleteDone: Array<Todo>;
  todoToggleDone: Todo;
  todoUpdate: Todo;
};


export type MutationTodoCreateArgs = {
  data: TodoCreate;
};


export type MutationTodoDeleteArgs = {
  id: Scalars['String']['input'];
  permanent?: InputMaybe<Scalars['Boolean']['input']>;
};


export type MutationTodoToggleDoneArgs = {
  id: Scalars['String']['input'];
};


export type MutationTodoUpdateArgs = {
  data: TodoUpdate;
  id: Scalars['String']['input'];
};

/** Pagination async_graphql input struct to use in search query. */
export type Pagination = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type Query = {
  __typename?: 'Query';
  hello: HelloGql;
  todoCount: Scalars['Int']['output'];
  todoCountDone: Scalars['Int']['output'];
  todoDetail?: Maybe<Todo>;
  todoSearch: Array<Todo>;
  todoSearch2024: Array<Todo>;
};


export type QueryTodoCountArgs = {
  filter?: InputMaybe<TodoFilter>;
  includeDeleted?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryTodoDetailArgs = {
  id: Scalars['String']['input'];
  includeDeleted?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryTodoSearchArgs = {
  filter?: InputMaybe<TodoFilter>;
  includeDeleted?: InputMaybe<Scalars['Boolean']['input']>;
  orderBy?: InputMaybe<Array<TodoOrderBy>>;
  page?: InputMaybe<Pagination>;
};


export type QueryTodoSearch2024Args = {
  filter?: InputMaybe<TodoFilter>;
  includeDeleted?: InputMaybe<Scalars['Boolean']['input']>;
  orderBy?: InputMaybe<Array<TodoOrderBy>>;
  page?: InputMaybe<Pagination>;
};

export type Todo = {
  __typename?: 'Todo';
  content: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  createdById?: Maybe<Scalars['String']['output']>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  deletedById?: Maybe<Scalars['String']['output']>;
  done: Scalars['Boolean']['output'];
  id: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedById?: Maybe<Scalars['String']['output']>;
};

/** Input payload for creating a new Todo. */
export type TodoCreate = {
  content: Scalars['String']['input'];
};

export type TodoFilter = {
  AND?: InputMaybe<Array<TodoFilter>>;
  NOT?: InputMaybe<TodoFilter>;
  OR?: InputMaybe<Array<TodoFilter>>;
  content?: InputMaybe<Scalars['String']['input']>;
  content_endsWith?: InputMaybe<Scalars['String']['input']>;
  content_gt?: InputMaybe<Scalars['String']['input']>;
  content_gte?: InputMaybe<Scalars['String']['input']>;
  content_in?: InputMaybe<Array<Scalars['String']['input']>>;
  content_like?: InputMaybe<Scalars['String']['input']>;
  content_lt?: InputMaybe<Scalars['String']['input']>;
  content_lte?: InputMaybe<Scalars['String']['input']>;
  content_ne?: InputMaybe<Scalars['String']['input']>;
  content_notIn?: InputMaybe<Array<Scalars['String']['input']>>;
  content_notLike?: InputMaybe<Scalars['String']['input']>;
  content_startsWith?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['DateTime']['input']>;
  createdAt_gt?: InputMaybe<Scalars['DateTime']['input']>;
  createdAt_gte?: InputMaybe<Scalars['DateTime']['input']>;
  createdAt_in?: InputMaybe<Array<Scalars['DateTime']['input']>>;
  createdAt_lt?: InputMaybe<Scalars['DateTime']['input']>;
  createdAt_lte?: InputMaybe<Scalars['DateTime']['input']>;
  createdAt_ne?: InputMaybe<Scalars['DateTime']['input']>;
  createdAt_notIn?: InputMaybe<Array<Scalars['DateTime']['input']>>;
  createdById?: InputMaybe<Scalars['String']['input']>;
  createdById_in?: InputMaybe<Array<Scalars['String']['input']>>;
  createdById_ne?: InputMaybe<Scalars['String']['input']>;
  createdById_notIn?: InputMaybe<Array<Scalars['String']['input']>>;
  deletedAt?: InputMaybe<Scalars['DateTime']['input']>;
  deletedAt_gt?: InputMaybe<Scalars['DateTime']['input']>;
  deletedAt_gte?: InputMaybe<Scalars['DateTime']['input']>;
  deletedAt_in?: InputMaybe<Array<Scalars['DateTime']['input']>>;
  deletedAt_lt?: InputMaybe<Scalars['DateTime']['input']>;
  deletedAt_lte?: InputMaybe<Scalars['DateTime']['input']>;
  deletedAt_ne?: InputMaybe<Scalars['DateTime']['input']>;
  deletedAt_notIn?: InputMaybe<Array<Scalars['DateTime']['input']>>;
  deletedById?: InputMaybe<Scalars['String']['input']>;
  deletedById_in?: InputMaybe<Array<Scalars['String']['input']>>;
  deletedById_ne?: InputMaybe<Scalars['String']['input']>;
  deletedById_notIn?: InputMaybe<Array<Scalars['String']['input']>>;
  done?: InputMaybe<Scalars['Boolean']['input']>;
  done_ne?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<Scalars['String']['input']>>;
  id_ne?: InputMaybe<Scalars['String']['input']>;
  id_notIn?: InputMaybe<Array<Scalars['String']['input']>>;
  updatedAt?: InputMaybe<Scalars['DateTime']['input']>;
  updatedAt_gt?: InputMaybe<Scalars['DateTime']['input']>;
  updatedAt_gte?: InputMaybe<Scalars['DateTime']['input']>;
  updatedAt_in?: InputMaybe<Array<Scalars['DateTime']['input']>>;
  updatedAt_lt?: InputMaybe<Scalars['DateTime']['input']>;
  updatedAt_lte?: InputMaybe<Scalars['DateTime']['input']>;
  updatedAt_ne?: InputMaybe<Scalars['DateTime']['input']>;
  updatedAt_notIn?: InputMaybe<Array<Scalars['DateTime']['input']>>;
  updatedById?: InputMaybe<Scalars['String']['input']>;
  updatedById_in?: InputMaybe<Array<Scalars['String']['input']>>;
  updatedById_ne?: InputMaybe<Scalars['String']['input']>;
  updatedById_notIn?: InputMaybe<Array<Scalars['String']['input']>>;
};

export enum TodoOrderBy {
  ContentAsc = 'ContentAsc',
  ContentDesc = 'ContentDesc',
  CreatedAtAsc = 'CreatedAtAsc',
  CreatedAtDesc = 'CreatedAtDesc',
  CreatedByIdAsc = 'CreatedByIdAsc',
  CreatedByIdDesc = 'CreatedByIdDesc',
  DeletedAtAsc = 'DeletedAtAsc',
  DeletedAtDesc = 'DeletedAtDesc',
  DeletedByIdAsc = 'DeletedByIdAsc',
  DeletedByIdDesc = 'DeletedByIdDesc',
  DoneAsc = 'DoneAsc',
  DoneDesc = 'DoneDesc',
  IdAsc = 'IdAsc',
  IdDesc = 'IdDesc',
  UpdatedAtAsc = 'UpdatedAtAsc',
  UpdatedAtDesc = 'UpdatedAtDesc',
  UpdatedByIdAsc = 'UpdatedByIdAsc',
  UpdatedByIdDesc = 'UpdatedByIdDesc'
}

/** Input payload for updating a Todo's content. */
export type TodoUpdate = {
  content: Scalars['String']['input'];
};

export const HelloGqlFields = ['id', 'message', 'timestamp'] as const
export const PaginationFields = ['limit', 'offset'] as const
export const TodoFields = ['content', 'createdAt', 'createdById', 'deletedAt', 'deletedById', 'done', 'id', 'updatedAt', 'updatedById'] as const
export const TodoCreateFields = ['content'] as const
export const TodoFilterFields = ['AND', 'NOT', 'OR', 'content', 'content_endsWith', 'content_gt', 'content_gte', 'content_in', 'content_like', 'content_lt', 'content_lte', 'content_ne', 'content_notIn', 'content_notLike', 'content_startsWith', 'createdAt', 'createdAt_gt', 'createdAt_gte', 'createdAt_in', 'createdAt_lt', 'createdAt_lte', 'createdAt_ne', 'createdAt_notIn', 'createdById', 'createdById_in', 'createdById_ne', 'createdById_notIn', 'deletedAt', 'deletedAt_gt', 'deletedAt_gte', 'deletedAt_in', 'deletedAt_lt', 'deletedAt_lte', 'deletedAt_ne', 'deletedAt_notIn', 'deletedById', 'deletedById_in', 'deletedById_ne', 'deletedById_notIn', 'done', 'done_ne', 'id', 'id_in', 'id_ne', 'id_notIn', 'updatedAt', 'updatedAt_gt', 'updatedAt_gte', 'updatedAt_in', 'updatedAt_lt', 'updatedAt_lte', 'updatedAt_ne', 'updatedAt_notIn', 'updatedById', 'updatedById_in', 'updatedById_ne', 'updatedById_notIn'] as const
export const TodoUpdateFields = ['content'] as const

import { createMutationFn, createQueryHook } from './operation-hook'
export const useFetchHello = createQueryHook<'hello', HelloGql, HelloGql, Record<string, never>>('hello', [])
export const useFetchTodoCount = createQueryHook<'todoCount', number, number, { filter?: InputMaybe<TodoFilter>; includeDeleted?: InputMaybe<boolean> }>('todoCount', [{ name: 'filter', graphqlType: 'TodoFilter' }, { name: 'includeDeleted', graphqlType: 'Boolean' }])
export const useFetchTodoCountDone = createQueryHook<'todoCountDone', number, number, Record<string, never>>('todoCountDone', [])
export const useFetchTodoDetail = createQueryHook<'todoDetail', Todo, Maybe<Todo>, { id: string; includeDeleted?: InputMaybe<boolean> }>('todoDetail', [{ name: 'id', graphqlType: 'String!' }, { name: 'includeDeleted', graphqlType: 'Boolean' }])
export const useFetchTodoSearch = createQueryHook<'todoSearch', Todo, Array<Todo>, { filter?: InputMaybe<TodoFilter>; includeDeleted?: InputMaybe<boolean>; orderBy?: InputMaybe<Array<TodoOrderBy>>; page?: InputMaybe<Pagination> }>('todoSearch', [{ name: 'filter', graphqlType: 'TodoFilter' }, { name: 'includeDeleted', graphqlType: 'Boolean' }, { name: 'orderBy', graphqlType: '[TodoOrderBy!]' }, { name: 'page', graphqlType: 'Pagination' }])
export const useFetchTodoSearch2024 = createQueryHook<'todoSearch2024', Todo, Array<Todo>, { filter?: InputMaybe<TodoFilter>; includeDeleted?: InputMaybe<boolean>; orderBy?: InputMaybe<Array<TodoOrderBy>>; page?: InputMaybe<Pagination> }>('todoSearch2024', [{ name: 'filter', graphqlType: 'TodoFilter' }, { name: 'includeDeleted', graphqlType: 'Boolean' }, { name: 'orderBy', graphqlType: '[TodoOrderBy!]' }, { name: 'page', graphqlType: 'Pagination' }])
export const todoCreate = createMutationFn<Todo, Todo, { data: TodoCreate }>('todoCreate', [{ name: 'data', graphqlType: 'TodoCreate!' }])
export const todoDelete = createMutationFn<Todo, Todo, { id: string; permanent?: InputMaybe<boolean> }>('todoDelete', [{ name: 'id', graphqlType: 'String!' }, { name: 'permanent', graphqlType: 'Boolean' }])
export const todoDeleteDone = createMutationFn<Todo, Array<Todo>, Record<string, never>>('todoDeleteDone', [])
export const todoToggleDone = createMutationFn<Todo, Todo, { id: string }>('todoToggleDone', [{ name: 'id', graphqlType: 'String!' }])
export const todoUpdate = createMutationFn<Todo, Todo, { data: TodoUpdate; id: string }>('todoUpdate', [{ name: 'data', graphqlType: 'TodoUpdate!' }, { name: 'id', graphqlType: 'String!' }])
