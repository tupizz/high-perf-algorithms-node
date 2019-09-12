/* eslint-disable  */
import { createHmac } from 'crypto';

const doHeavyStuff = item => {
  createHmac('sha256', 'secret')
    .update(new Array(1000000).fill(item).join('.'))
    .digest('hex');
};

const proccessChunk = () => {
  if (ARRAY_CHUNK.length === 0) {
    // After the whole array are executed
    return;
  }

  console.log('proccessing chunk');

  const subarray = ARRAY_CHUNK.splice(0, 10);
  for (const item of subarray) {
    //  do heavy stuff for each item on the array
    doHeavyStuff(item);
  }

  // Put the function back in the queue
  setImmediate(proccessChunk);
};

const ARRAY_CHUNK = new Array(200).fill('something');

/**
 * MAIN FUNCTION PROCCESS
 *
 * - Node.js won’t evaluate the next code block in the event queue until the previous
 *   one has finished executing. So one simple thing we can do is split our code into
 *   smaller synchronous code blocks and call setImmediate(callback) to tell Node.js
 *   we are done and that it can continue executing pending things that are in the queue.
 *
 * - It can continue on the next iteration or ‘tick’ of the event loop. Let’s see how
 *   we can refactor some code to take advantage of this. Let’s imagine we have a large
 *   array that we want to process and every item on the array requires CPU-intensive
 *   processing.
 */

(function() {
  proccessChunk();

  const interval = setInterval(() => {
    console.log('tick');
    if (ARRAY_CHUNK.length === 0) {
      clearInterval(interval);
    }
  }, 0);
})();

/**
 * CONSOLE LOG OUTPUT
 */

/**
 *   proccessing chunk
 *   tick
 *   proccessing chunk
 *   tick
 *   proccessing chunk
 *   tick
 *   proccessing chunk
 *   tick
 *   proccessing chunk
 *   tick
 *   proccessing chunk
 *   tick
 *   proccessing chunk
 *   tick
 *   proccessing chunk
 *   tick
 *   proccessing chunk
 *   tick
 *   proccessing chunk
 *   tick
 *   proccessing chunk
 *   tick
 *   proccessing chunk
 *   tick
 *   proccessing chunk
 *   tick
 *   proccessing chunk
 *   tick
 *   proccessing chunk
 *   tick
 *   proccessing chunk
 *   tick
 *   proccessing chunk
 *   tick
 *   proccessing chunk
 *   tick
 *   proccessing chunk
 *   tick
 *   proccessing chunk
 *   tick
 *   Done in 13.15s.
 */
