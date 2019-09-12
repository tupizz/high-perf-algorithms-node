import WorkerFarm from 'worker-farm';

const service = WorkerFarm(require.resolve('./script'));

service('hello', (err, output) => {
  console.log(output);
});

service('hello', (err, output) => {
  console.log(output);
});

service('hello', (err, output) => {
  console.log(output);
});

service('hello', (err, output) => {
  console.log(output);
});
