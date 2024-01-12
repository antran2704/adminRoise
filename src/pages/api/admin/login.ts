import type { NextApiRequest, NextApiResponse } from "next";
import httpProxy, { ProxyResCallback } from "http-proxy";
import { getCookie, setCookie } from "cookies-next";
import { ClientRequest } from "http";
import { IKeyToken } from "~/interface";

const proxy = httpProxy.createProxyServer();

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.url) {
    req.url = req.url.replace(/^\/api/, "");
  }

  return new Promise<void>((resolve, reject) => {
    proxy.web(req, res, {
      target: process.env.ENDPOINT_SERVER,
      changeOrigin: true,
      selfHandleResponse: true,
    });

    const handleLogin: ProxyResCallback = (proxyRes) => {
      let body: string = "";

      proxyRes.on("data", function (chunk) {
        body += chunk;
      });

      proxyRes.on("end", function () {
        try {
          const response = JSON.parse(body);
          const status = response.status;

          if (status === 200) {
            const data: IKeyToken = {
              accessToken: response.payload.accessToken,
              refreshToken: response.payload.refreshToken,
              apiKey: response.payload.apiKey,
              publicKey: response.payload.publicKey,
            };

            setCookie("accessToken", data.accessToken, {
              req,
              res,
              httpOnly: true,
            });
            setCookie("publicKey", data.publicKey, {
              req,
              res,
              httpOnly: true,
            });
            setCookie("refreshToken", data.refreshToken, {
              req,
              res,
              httpOnly: true,
            });
            setCookie("apiKey", data.apiKey, {
              req,
              res,
              httpOnly: true,
            });
          }

          res.status(status).json(response);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    };

    proxy.once("proxyRes", handleLogin);

    proxy.once("error", reject);
  });
};
