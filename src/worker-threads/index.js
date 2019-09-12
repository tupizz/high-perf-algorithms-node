/* eslint-disable import/no-unresolved */
import { Worker } from 'worker_threads';

const runService = workerData => {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./src/worker-threads/service.js', {
      workerData,
    });
    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', code => {
      if (code !== 0)
        reject(new Error(`Worker stopped with exit code ${code}`));
    });
  });
};

const run = async () => {
  const result = await runService('world');
  console.log(result);
};

run().catch(err => console.error(err));
