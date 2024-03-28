var cron = require('node-cron');
/**
 * https://www.cyberciti.biz/faq/linux-unix-formatting-dates-for-display/?fbclid=IwAR2Gw9mMKT1W9eWI1wpuQpM4LlJuLNkBxpEQ5TeKdTE5LcLlbDUkPhoBpEY
 */
//12h15p
cron.schedule('15 12 * * *', () => {
    console.log(`---run cron_job---`);
    const exec = require('child_process').exec;
    var yourscript = exec('sh provisioning/scripts/backup_db.sh',
    (error, stdout, stderr) => {
        console.log(stdout);
        console.log(stderr);
        if (error !== null) {
            console.log(`exec error: ${error}`);
        }
    });
});

//0h15p
cron.schedule('15 0 * * *', () => { 
    const exec = require('child_process').exec;
    var yourscript = exec('sh provisioning/scripts/backup_db.sh',
    (error, stdout, stderr) => {
        // console.log(stdout);
        // console.log(stderr);
        // if (error !== null) {
        //     console.log(`exec error: ${error}`);
        // }
    });
});