import { ClassValue, cn } from 'cn';

export const bui = (...inputs: ClassValue[]) => {
  return cn(inputs);
};
