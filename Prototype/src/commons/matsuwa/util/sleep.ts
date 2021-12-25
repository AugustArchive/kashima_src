  
/**
 * Pauses the process until the duration is up
 * @param duration The duration in milliseconds
 */
export const sleep = (duration: number) => new Promise(resolve => setTimeout(resolve, duration));