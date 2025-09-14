export interface PostmanCollection {
  info: {
    name: string;
    description?: string;
    version?: string;
    schema: string;
  };
  item: PostmanItem[];
  variable?: PostmanVariable[];
}

export interface PostmanItem {
  name: string;
  request: PostmanRequest;
  response?: PostmanResponse[];
}

export interface PostmanRequest {
  method: string;
  header?: PostmanHeader[];
  body?: PostmanRequestBody;
  url: PostmanUrl;
  description?: string;
}

export interface PostmanUrl {
  raw: string;
  protocol?: string;
  host?: string[];
  port?: string;
  path?: string[];
  query?: PostmanQuery[];
  variable?: PostmanUrlVariable[];
}

export interface PostmanQuery {
  key: string;
  value?: string;
  description?: string;
  disabled?: boolean;
}

export interface PostmanUrlVariable {
  key: string;
  value?: string;
  description?: string;
}

export interface PostmanHeader {
  key: string;
  value: string;
  description?: string;
  disabled?: boolean;
}

export interface PostmanRequestBody {
  mode: 'raw' | 'urlencoded' | 'formdata';
  raw?: string;
  options?: {
    raw?: {
      language: string;
    };
  };
}

export interface PostmanResponse {
  name: string;
  originalRequest: PostmanRequest;
  status: string;
  code: number;
  header: PostmanHeader[];
  body: string;
}

export interface PostmanVariable {
  key: string;
  value: string;
  type?: string;
  description?: string;
}

export interface CurlCommand {
  endpoint: string;
  method: string;
  curl: string;
  description?: string;
}