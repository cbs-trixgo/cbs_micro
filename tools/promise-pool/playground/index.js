const PromisePool = require('@supercharge/promise-pool')

/**
 * ref: https://futurestud.io/tutorials/node-js-run-async-functions-in-batches
 * use-cases:
 *  - Promise.all: cần phải thực hiện tất cả batch1 mới chạy batch2(batch tiếp theo)
 *  - PromisePool: giả sử batch1(5 task), task 1 trong batch1 done -> sẽ chạy task1 của batch2 (chứ ko chờ batch1 hoàn thành tất cả như PromiseAll)
 */

const users = [  
  { id: 1, name: 'Marcus', timer: 1000 },
  { id: 2, name: 'Norman', timer: 2000 },
  { id: 3, name: 'Christian', timer: 1000 },
  { id: 4, name: 'Marcus 2', timer: 2000 },
  { id: 5, name: 'Norman 2', timer: 1000 },
  { id: 6, name: 'Christian 2', timer: 2000 },
]

const fakePromise = (user, timeer) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            return resolve({ ...user, timer: user.timer })
        }, user.timer);
    })
} 

/**
 * Process the list of 50,000 users with a concurrency of 20 items.
 * The promise pool takes the next task from the list as soon
 * as one of the active tasks in the pool finishes.
 */
async function run(users) {
    const { results, errors } = await PromisePool  
        .for(users)
        .withConcurrency(2)
        .process(async data => {
            const newData = await fakePromise(data);
            console.log({ newData })
            return newData
        })

    console.log({ results, errors });
}

run(users)
    .then(result => console.log({ result }))
    .catch(err => console.log({ err }))