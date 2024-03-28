// calculate AVG
// FOR -> large
/**
 *
 * @param {*} n -> length
 * @param {*} cbHeavyCalculate -> CallBack when out-box process
 */
function heavyCalulateAvg(n, cbHeavyCalculate) {
    let total = 0;
    function help(i, cbHelp) {
        total += i;
        if (i == n)
            process.nextTick(_ => cbHelp(total))

        setImmediate(help.bind(null, i+1, cbHelp)); // split => next tick - for receive other external_events
    }

    // total is result return by process.nextTick(_ => cbHelp(total))
    help(1, total => {
        console.log({ total });
        cbHeavyCalculate(total/n)
    });
}

// function checkHealthy() {
//     for(let i = 0; i < 100; i++) {
//         console.log(`healthy------->>>>`);
//     }
// }

// heavyCalulateAvg(1000, avgResult => {
//     console.log({ avgOf1000: avgResult })
// })

// checkHealthy();