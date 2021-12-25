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

/** Enum of all close codes */
export enum CloseCodes {
  /** Unknown exception happened */
  Unknown = 1000,

  /** Server has closed unexpectly */
  Closed = 1001,

  /** No heartbeat was sent */
  NoAckedHeartbeat = 1002,

  /** No `IDENITFY` payload was sent */
  NoAckedIdentify = 1003
}

/** Enum of all OPCodes avaliable */
export enum OPCodes {
  /** Refresh the heartbeat timeout */
  Heartbeat = 'heartbeat',

  /** If we received an `IDENTIFY` opcode */
  Identify = 'identify',

  /** Update the user's status */
  Status = 'status',

  /** OPCode when an error occurs */
  Error = 'error'
}