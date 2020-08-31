
export interface IDeferredPromise<T> extends Promise<T> {
  resolve(value: T | PromiseLike<T>): void;

  reject(reason?: any): void;
}

export function deferredPromise<T>(): IDeferredPromise<T> {
  let resolve;
  let reject;
  let prom = new Promise((res, rej) => { resolve = res; reject = rej; }) as IDeferredPromise<T>;
  prom.resolve = resolve;
  prom.reject = reject;
  return prom;
}
