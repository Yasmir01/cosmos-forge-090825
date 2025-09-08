import { Request, Response } from "express";

export function handleSSE(req: Request, res: Response) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const send = (data: unknown) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  send({ type: "hello", ts: Date.now() });
  const interval = setInterval(() => {
    send({ type: "tick", ts: Date.now() });
  }, 5000);

  req.on("close", () => {
    clearInterval(interval);
  });
}
