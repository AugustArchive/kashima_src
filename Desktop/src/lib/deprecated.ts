import { styles, colors } from 'leeks.js';

/**
 * Deprecates a class that shouldn't be used
 */
export function deprecateClass(): ClassDecorator {
  return (target: any) => console.warn(`${colors.yellow('Deprecation Notice')}: ${styles.bold(`Class ${target.name} is deprecated and will be removed in a future release.`)}`);
}

/**
 * Deprecates a method that shouldn't be used
 */
export function deprecateMethod(): MethodDecorator {
  return (target: any, property: string | symbol) => console.warn(`${colors.yellow('Deprecation Notice')}: ${styles.bold(`Method ${String(property)} from class ${target.name} is deprecated and will be removed in a future release.`)}`);
}