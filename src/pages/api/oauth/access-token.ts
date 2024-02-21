import type { NextApiRequest, NextApiResponse } from "next";
import httpProxy, { ProxyResCallback } from "http-proxy";
import { setCookie } from "cookies-next";
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

          if (!response.code) {
            setCookie("accessToken", response.accessToken, {
              req,
              res,
              httpOnly: true,
              maxAge: response.expiresIn,
            });
            res.status(200).json(response);
          } else {
            res.status(response.code).json(response);
          }

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
