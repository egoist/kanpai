import http from "http";
import https from "https";

const isSuccess = (status: number) => {
  return status >= 200 && status < 300;
};

type RequestResult = {
  json: () => any;
  text: () => string;
};

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export const request = (
  url: string,
  {
    method,
    headers,
    data,
  }: {
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    headers?: Record<string, string | undefined>;
    data?: Record<string, any>;
  }
) => {
  return new Promise<RequestResult>((resolve, reject) => {
    const req = (url.startsWith("https://") ? https : http).request(
      url,
      {
        method,
        headers:
          headers &&
          Object.keys(headers).reduce<Record<string, any>>(
            (res, key) => {
              if (headers[key] !== undefined) {
                res[key] = headers[key];
              }
              return res;
            },
            {
              "user-agent": "kanpai",
            }
          ),
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          if (res.statusCode === 404) {
            return reject(new NotFoundError(data));
          }
          if (res.statusCode && !isSuccess(res.statusCode)) {
            return reject(new Error(data));
          }
          resolve({ json: () => JSON.parse(data), text: () => data });
        });
      }
    );
    req.on("error", (err) => {
      reject(err);
    });
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};
