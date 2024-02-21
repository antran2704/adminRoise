import type { NextApiRequest, NextApiResponse } from "next";
import httpProxy, { ProxyResCallback } from "http-proxy";
import { getCookie, getCookies, setCookie } from "cookies-next";

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

  const refreshToken = getCookie("refreshToken", { req, res });

  if (refreshToken) {
    req.headers["refresh-token"] = `Token ${refreshToken}`;
  }

  return new Promise<void>((resolve, reject) => {
    const handleRefreshToken: ProxyResCallback = (proxyRes) => {
      let body: string = "";

      proxyRes.on("data", function (chunk) {
        body += chunk;
      });

      proxyRes.on("end", function () {
        try {
          const response = JSON.parse(body);
          const status = response.status;

          if (status === 200) {
            setCookie("accessToken", response.payload.newAccessToken, {
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

    proxy.web(req, res, {
      target: process.env.ENDPOINT_SERVER,
      changeOrigin: true,
      selfHandleResponse: true,
    });

    proxy.once("proxyRes", handleRefreshToken);

    proxy.once("error", reject);
  });
};
