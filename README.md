# The naïve solution: tick, tick, tick

- Node.js won’t evaluate the next code block in the event queue until the previous one has finished executing. So one simple thing we can do is split our code into smaller synchronous code blocks and call setImmediate(callback) to tell Node.js we are done and that it can continue executing pending things that are in the queue.

- It can continue on the next iteration or ‘tick’ of the event loop. Let’s see how we can refactor some code to take advantage of this. Let’s imagine we have a large array that we want to process and every item on the array requires CPU-intensive processing:

```javascript
const arr = [
  /*large array*/
];
for (const item of arr) {
  // do heavy stuff for each item on the array
}
// code that runs after the whole array is executed
```

- Now we process ten items each time and call setImmediate(callback) so if there’s something else the program needs to do, it will do it between those chunks of ten items. I’ve added a setInterval() for demonstrating exactly that.

- As you can see the code gets more complicated. And many times the algorithm is a lot more complex than this so it’s hard to know where to put the setImmediate() to find a good balance. Besides, the code now is asynchronous and if we depend on third-party libraries we might not be able to split the execution into smaller chunks.

# Background proccess

- So setImmediate() is maybe okay for some simple use cases, but it’s far from being an ideal solution. Also, we didn’t have threads (for good reasons) and we don’t want to modify the language. Can we do parallel processing without threads? **Yes, what we need is just some kind of background processing: a way of running a task with input, that could use whatever amount of CPU and time it needs**, and return a result back to the main application. Something like this:

```javascript
// Runs `script.js` in a new environment without sharing memory.
const service = createService('script.js');
// We send an input and receive an output
service.compute(data, function(err, result) {
  // result available here
});
```

- The reality is that we can already do background processing in Node.js. We can fork the process (https://nodejs.org/api/child_process.html#child_process_child_process_fork_modulepath_args_options) and do exactly that using message passing. The main process can communicate with the child process by sending and receiving events. No memory is shared. All the data exchanged is “cloned” meaning that changing it in one side doesn’t change it on the other side. Like an HTTP response, once you have sent it, the other side has just a copy of it. If we don’t share memory, we don’t have race conditions and we don’t need threads. Problem solved!

- Well, hold on. This is a solution, but it’s not the ideal solution. Forking a process is an expensive process in terms of resources. And it is slow. It means running a new virtual machine from scratch using a lot of memory since processes don’t share memory. Can we reuse the same forked process? Sure, but sending different heavy workloads that are going to be executed synchronously inside the forked process, has two problems:

  - Yes, you are not blocking the main app, but the forked process will only be able to process one task at a time. If you have two tasks, one that will take 10s and one that will take 1s (in that order), it’s not ideal to have to wait 10s to execute the second task. Since we are forking processes we want to take advantage of the scheduling of the operating system and all the cores of our machine. The same way you can listen to music and browse the internet at the same time you can fork two processes and execute all the tasks in parallel.

  - Besides, if one task crashes the process, it will leave all tasks sent to the same process unfinished.

- In order to fix these problems we need multiple forks, not only one, but we need to limit the number of forked processes because each one will have all the virtual machine code duplicated in memory, meaning a few Mbs per process and a non-trivial boot time. So, like database connections, we need a pool of processes ready to be used, run a task at a time in each one and reuse the process once the task has finished. This looks complex to implement, and it is! Let’s use worker-farm to help us out:
