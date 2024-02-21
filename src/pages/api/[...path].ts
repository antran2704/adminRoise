import type { NextApiRequest, NextApiResponse } from "next";
import httpProxy from "http-proxy";
import { getCookies } from "cookies-next";

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

  const { accessToken } = getCookies({ req, res });

  if (accessToken) {
    req.headers.Authorization = `Bear ${accessToken}`;
  }

  return new Promise<void>((resolve, reject) => {
    proxy.web(req, res, {
      target: process.env.ENDPOINT_SERVER,
      changeOrigin: true,
      selfHandleResponse: false,
    });

    proxy.once("proxyRes", () => {
      resolve;
    });

    proxy.once("error", reject);
  });
};
