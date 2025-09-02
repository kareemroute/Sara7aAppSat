import { rateLimit } from "express-rate-limit";

export function limiter() {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    message: {
      statusCode: 429,
      message: "Too many requests from this IP, please try again",
    },
  });

  return limiter;
}
