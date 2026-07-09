import { Logger } from "../../application/ports/out/Logger";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyUseCase = { execute: (...args: any[]) => Promise<any> };

/**
 * Wraps any use case with info/error logging without modifying existing code.
 * Uses a Proxy so the wrapped object still satisfies the original interface.
 */
export function withLogging<T extends AnyUseCase>(
  useCase: T,
  name: string,
  logger: Logger,
): T {
  return new Proxy(useCase, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);

      if (prop !== "execute" || typeof value !== "function") {
        return value;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return async (...args: any[]) => {
        logger.info(`[UseCase] ${name} started`);
        try {
          const result = await value.apply(target, args);
          logger.info(`[UseCase] ${name} completed`);
          return result;
        } catch (error) {
          logger.error(`[UseCase] ${name} failed`, error);
          throw error;
        }
      };
    },
  });
}
