declare module 'jexl' {
  export interface Expression {
    eval(context?: any): Promise<any>;
  }
  export function compile(expression: string): Expression;
  export function eval(expression: string, context?: any): Promise<any>;
}
