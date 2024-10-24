type Bindings = {
  AUTH_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
};

export type Env = { Bindings: Bindings };

export type ErrorResponse = {
  success: boolean;
  message: string;
};
