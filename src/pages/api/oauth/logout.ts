import { deleteCookie } from "cookies-next";
import { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  deleteCookie("accessToken", { req, res });
  deleteCookie("publicKey", { req, res });
  deleteCookie("refreshToken", { req, res });
  deleteCookie("apiKey", { req, res });

  return res.status(200).json({ message: "Logout success" });
};
