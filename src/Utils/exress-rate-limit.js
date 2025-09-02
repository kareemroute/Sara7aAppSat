import { rateLimit } from "express-rate-limit";

export function limiter() {
  const limiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 3,
    message: {
      statusCode: 429,
      message: "Too many requests from this IP, please try again",
    },
  });

  return limiter;
}
