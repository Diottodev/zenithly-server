export type THandleError = {
  status: string;
  body: {
    code: string;
    message: string;
  };
  headers: Record<string, string>;
  statusCode: number;
};
