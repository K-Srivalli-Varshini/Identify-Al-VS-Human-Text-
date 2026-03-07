import serverless from "serverless-http";
import { createApp } from "../server.js";

let handler: any;

export default async (req: any, res: any) => {
  if (!handler) {
    const app = await createApp();
    handler = serverless(app);
  }
  return handler(req, res);
};
