const Agenda            = require('agenda');
const moment            = require('moment');
const ObjectID 			= require('mongodb').ObjectID;
const { MONGODB_URL } 	= require('../../../tools/db/utils');

let agenda;

(async function run() {
    // let client = await MongoClient.connect(MONGODB_URL);
    // agenda = new Agenda().mongo(client.db(process.env.MONGO_DB || "agendatest"), process.env.AGENDA_COLLECTION || "agenda_jobs");

	const connectionOpts = {
		db: {
			address: MONGODB_URL,
			collection: process.env.AGENDA_COLLECTION || "agenda_jobs",
			options: { useNewUrlParser: true }
		},
	};
    agenda = new Agenda(connectionOpts)

	await new Promise(resolve => agenda.once('ready', resolve));
})(); //IIFE func - run now

module.exports = {
    addJob: {
        params: {},
        async handler(ctx) {
            try {
                let timeScheduler = new Date(Date.now() + 10000);
                for(let i = 0; i<10; i++) {
                    agenda.schedule(timeScheduler, 'reminder_birthday');
                    console.log(`agenda: ${i} added`)
                }
                return {
                    error: false, ctx
                }
            } catch (error) {
                return { error:  true, message: error.message };
            }
        }
    },

	addJobMuteConversation: {
        params: {
            conversationID	: { type: "string" },
            userID			: { type: "string" },
            timeMute		: { type: "string" },
        },
        async handler(ctx) {
            try {
                let { conversationID, userID, timeMute } = ctx.params;
                let timeScheduler = '';

				switch (+timeMute) {
					case 1:
						timeScheduler = "1 hours";
						break;
					case 4:
						timeScheduler = "4 hours";
						break;
					case 8:
						timeScheduler = "tomorrow at 8am";
						break;
					default:
						// timeScheduler = `${timeMute} hours`;
						break;
				}

				if(!timeScheduler)
					throw new Error("timeScheduler is empty");

				agenda.schedule(timeScheduler, 'update_mute_conversation', {
					conversationID, userID, isMute: false
				});
				console.log(`agenda: update_mute_conversation added - ${timeScheduler}`);

                return { error: false, message: 'success' };
            } catch (error) {
				throw new Error(error.message);
            }
        }
    },

	deleteJobMuteConversation: {
        params: {
			conversationID	: { type: "string" },
			userID			: { type: "string" },
		},
        async handler(ctx) {
            try {
				let { conversationID, userID } = ctx.params;

				if(!conversationID || !userID)
					throw new Error("Request params conversationID or userID invalid");

				const listJob = await agenda.jobs({
					name: "update_mute_conversation",
					"data.conversationID": conversationID,
					"data.userID": userID,
				});

				if(listJob && listJob.length){
					const jobsID = listJob.map(job => ObjectID(job.attrs._id));
					await agenda.cancel({ _id: { $in: jobsID } });
				}

                return { error: false, message: 'success' };
            } catch (error) {
				throw new Error(error.message);
            }
        }
    },

	addJobReminderConversation: {
        params: {
            conversationID	: { type: "string" },
            messageID		: { type: "string" },
            userID			: { type: "string" },
            remindTime		: { type: "string" },
            repeat			: { type: "string" },
            notifyFor		: { type: "string" },
        },
        async handler(ctx) {
            try {
                let { conversationID, messageID, userID, remindTime, repeat, notifyFor } = ctx.params;
				let humanTime = '';

				switch (repeat) {
					case 'daily':
						humanTime = '1 day';
						break;
					case 'weekly':
						humanTime = '1 week';
						break;
					case 'monthly':
						humanTime = '1 month';
						break;
					case 'yearly':
						humanTime = '1 year';
						break;
					default:
						break;
				}

				if(humanTime){
					const reminder = agenda.create('add_reminder_conversation', {
						conversationID, messageID, userID
					});
					await agenda.start();
					await reminder.repeatEvery(humanTime, {
						skipImmediate: true
					}).save();

					console.log(`agenda: add_reminder_conversation added - ${humanTime} - ${repeat} - ${notifyFor}`);
				}

				if(remindTime && repeat === 'once'){
					let timeScheduler = new Date(remindTime).getTime();

					agenda.schedule(timeScheduler, 'add_reminder_conversation', {
						conversationID, messageID, userID
					});
					console.log(`agenda: add_reminder_conversation added - ${new Date(remindTime)} - ${remindTime} - ${repeat} - ${notifyFor}`);
				}

                return { error: false, message: 'success' }
            } catch (error) {
                throw new Error(error.message);
            }
        }
    },

	deleteJobReminderConversation: {
        params: {
			conversationID	: { type: "string" },
			messageID		: { type: "string" },
		},
        async handler(ctx) {
            try {
				const { conversationID, messageID } = ctx.params;

				if(!conversationID || !messageID)
					throw new Error("Request params conversationID or messageID invalid");

				const listJob = await agenda.jobs({
					name: "add_reminder_conversation",
					"data.conversationID": conversationID,
					"data.messageID": messageID,
				});

				if(listJob && listJob.length){
					const jobsID = listJob.map(job => ObjectID(job.attrs._id));
					await agenda.cancel({ _id: { $in: jobsID } });
				}

                return { error: false, message: 'success' };
            } catch (error) {
                throw new Error(error.message);
            }
        }
    },

	addJobAutoDeleteMessageConversation: {
        params: {
            conversationID	: { type: "string" },
            messageID		: { type: "string" },
            userID			: { type: "string" },
            time			: { type: "string" },
        },
        async handler(ctx) {
            try {
                let { conversationID, messageID, userID, time } = ctx.params;
                let timeScheduler = '';

				switch (+time) {
					case 1:
						timeScheduler = "1 minutes";
						break;
					case 7:
						timeScheduler = "1 week";
						break;
					case 30:
						timeScheduler = "1 month";
						break;
					default:
						break;
				}

				if(!timeScheduler)
					throw new Error("timeScheduler is empty");

				agenda.schedule(timeScheduler, 'auto_delete_message_conversation', {
					conversationID,
					messageID,
					userID,
					time,
					isDelete: true,
				});
				console.log(`agenda: auto_delete_message_conversation added - ${timeScheduler}`);

                return { error: false, message: 'success' }
            } catch (error) {
                throw new Error(error.message);
            }
        }
    },

	deleteJobAutoDeleteMessageConversation: {
        params: {
			conversationID: { type: 'string' },
		},
        async handler(ctx) {
            try {
				const { conversationID } = ctx.params;

				if(!conversationID)
					throw new Error("Request params conversationID invalid");

				const listJob = await agenda.jobs({
					name: "auto_delete_message_conversation",
					"data.conversationID": conversationID
				});

				if(listJob && listJob.length){
					const jobsID = listJob.map(job => ObjectID(job.attrs._id));
					await agenda.cancel({ _id: { $in: jobsID } });
				}

                return { error: false, message: 'success' };
            } catch (error) {
				throw new Error(error.message);
            }
        }
    },

	addJobRefreshTokenZaloOA: {
		async handler() {
            try {
				const timeScheduler = new Date(moment().add(24, 'hours')).getTime();

				agenda.schedule(timeScheduler, 'zalo_oa_refresh_token');
				console.log(`agenda: zalo_oa_refresh_token added - ${timeScheduler}`);

                return { error: false, message: 'success' };
			} catch(error) {
				throw new Error(error.message);
			}
		}
	},

	addJobReminderExpiredTask: {
        params: {
            alert				: { type: "number" },
            status				: { type: "number" },
            actualFinishTime	: { type: "string" },
            taskID				: { type: "string" },
            userID				: { type: "string" },
        },
        async handler(ctx) {
            try {
				// Tham biến bên PCM truyền sang
                const { alert, actualFinishTime, status, taskID, userID, senderMail } = ctx.params;
                let timeScheduler = '', message = '';

				if(status === 3)
					return { error: true, message: "task is done" };

				// Thời hạn hoàn thành của Task
				timeScheduler = new Date(actualFinishTime).getTime();
				// timeScheduler = moment(timeScheduler).subtract(1, 'minute');

				switch (alert) {
					case 0.4:
						message = '15 phút';
						timeScheduler = moment(timeScheduler).subtract(15, 'minutes'); // .valueOf();
						break;
					case 1:
						message = '1 tiếng';
						timeScheduler = moment(timeScheduler).subtract(1, 'hour');
						break;
					case 2:
						message = '2 tiếng';
						timeScheduler = moment(timeScheduler).subtract(2, 'hours');
						break;
					case 24:
						message = '1 ngày';
						timeScheduler = moment(timeScheduler).subtract(1, 'day');
						break;
					case 48:
						message = '2 ngày';
						timeScheduler = moment(timeScheduler).subtract(2, 'days');
						break;
					default:
						break;
				}

				// Convert thành Timestamp để cho con Cron nó nhận
				timeScheduler = new Date(timeScheduler).getTime();

				if(!message)
                	return { error: true, message: "Not found alert time" };

				// Gọi thư viện Agenda để lên lịch theo key: add_reminder_expired_task
				agenda.schedule(timeScheduler, 'add_reminder_expired_task', {
					taskID,
					userID,
					message,
					senderMail,
				});
				console.log(`agenda: add_reminder_expired_task added - ${timeScheduler}`);

                return { error: false, message: 'success' }
            } catch (error) {
                return { error: true, message: error.message };
            }
        }
    },

	deleteJobReminderExpiredTask: {
        params: {
			taskID: { type: 'string' },
		},
        async handler(ctx) {
            try {
				const { taskID } = ctx.params;

				if(!taskID)
					return { error: true, message: "Request params taskID invalid" };

				const listJob = await agenda.jobs({
					name: "add_reminder_expired_task",
					"data.taskID": taskID
				});

				if(listJob && listJob.length){
					const jobsID = listJob.map(job => ObjectID(job.attrs._id));
					await agenda.cancel({ _id: { $in: jobsID } });
					console.log(`agenda: delete_job_reminder_expired_task canceled - taskID: ${taskID}`);
				}

                return { error: false, message: 'success' };
            } catch (error) {
				return { error: true, message: error.message };
            }
        }
    },

}