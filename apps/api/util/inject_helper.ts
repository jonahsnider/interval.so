/**
 * If you import something with `import type`, reflect-metadata isn't able to extract that from the build metadata.
 * This decorator should be applied to a class, which then requires you to take each of the constructor parameters and pass their constructors.
 *
 * @example
 * ```ts
 * @inject()
 * @injectHelper(MyDependency)
 * export class MyService {
 *   constructor(private readonly myDependency: MyDependency) {}
 * }
 * ```
 */
export function injectHelper(..._constructors: object[]) {
	return (_target: object) => {};
}
