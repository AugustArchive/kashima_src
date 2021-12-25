/*
 * Copyright (c) 2019-2020 LiquidBlast
 * 
 * All code contained in this software ("Software") is copyrighted by LiquidBlast and 
 * may not be used outside this project without written permission from LiquidBlast. Art 
 * assets and libraries are licensed by their respective owners.
 * 
 * Permission is hearby granted to use the Software under the following terms and conditions:
 * * You will not attempt to reverse engineer or modify the Software.
 * * You will not sell or distribute the Software under your own name without written permission 
 *   from LiquidBlast.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { WebSocketClient } from '../entities';
import { OPCodes } from '../../util/Enums';

// Symbol to fetch the methods
const SYMBOL = Symbol('$methods');

/** Method interface */
interface IMethod {
  /** The execute function */
  execute(client: WebSocketClient, payload: any, nonce: string): Promise<void>;

  /** The method OPCode */
  op: OPCodes;
}

/**
 * Function to get all method listeners
 * @param target The target
 * @returns An array of all the methods
 */
export function getAllMethods(target: any): IMethod[] {
  if (target.constructor == null) return [];

  const definitions = target.constructor[SYMBOL];
  if (!Array.isArray(definitions)) return [];

  return definitions;
}

/**
 * Decorator to register the method so it can be used in the onRequest webhook
 * @param op The OPCode itself
 */
export function Method(op: OPCodes): MethodDecorator {
  return (target: any, prop: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
    const key = String(prop);

    if (target.prototype !== undefined) throw new SyntaxError(`Cannot register OPCode "${op}" since it's on a static method, when it should be non-static (${target.name}#${key})`);
    if (!(target.constructor[SYMBOL])) target.constructor[SYMBOL] = [];

    (target.constructor[SYMBOL] as IMethod[]).push({
      execute: descriptor.value,
      op
    });
  };
}