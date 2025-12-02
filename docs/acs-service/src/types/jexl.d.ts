declare module 'jexl' {
  export interface Expression {
    eval(context?: any): Promise<any>;
  }

  export class Jexl {
    addFunction(name: string, fn: (...args: any[]) => any): void;
    addTransform(name: string, fn: (...args: any[]) => any): void;
    eval(expression: string, context?: any): Promise<any>;
    compile(expression: string): Expression;
  }
  
  const jexl: Jexl;
  export default jexl;
}

