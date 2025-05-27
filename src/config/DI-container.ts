class DIContainer {
  private static instance: DIContainer;
  private dependencies: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  register<T>(key: string, dependency: T): void {
    this.dependencies.set(key, dependency);
  }

  resolve<T>(key: string): T {
    if (!this.dependencies.has(key)) {
      throw new Error(`Dependency ${key} not found`);
    }
    return this.dependencies.get(key) as T;
  }
}


