"use strict";

const DbService                	    	= require("../../tools/mixins/db.mixin");
const CacheCleaner                	    = require("../../tools/mixins/cache.cleaner.mixin");
const Agenda            				= require('agenda');

const { CF_DOMAIN_SERVICES } 		    = require('../gateway/helper/domain.constant');
const { CF_ACTIONS_REMINDER } 	        = require('./helper/reminder.actions-constant');
const { CF_ACTIONS_CHATTING } 	        = require('../chatting/helper/chatting.actions-constant');
const { CF_ACTIONS_SUBJECT_PCM }		= require('../subject_pcm/helper/subject_pcm.actions-constant');
const { CF_ACTIONS_ZALO }				= require('../zalo_oa/helper/zalo.actions');

const { APP_KEYS, LANGUAGE_KEYS }		= require('../../tools/keys');
const { ENV_DEVICE_WEB_CBS }			= require('../notification/helper/notification.keys-constant');
const REMINDER__CORE_HANLDER            = require('./handler/reminder.core-handler');
const { MONGODB_URL } 					= require('../../tools/db/utils');

module.exports = {
	name: CF_DOMAIN_SERVICES.REMINDER,
	mixins: [
		DbService('reminder_cores'),
		DbService('reminder_tasks'),
		CacheCleaner([CF_DOMAIN_SERVICES.REMINDER])
    ],

	/**
	* Service metadata
	*/
	metadata: {

	},

	/**
	* Service dependencies
	*/
	dependencies: [
		CF_DOMAIN_SERVICES.AUTH
	],

	/**
	* Actions
	*/
	actions: {
		[CF_ACTIONS_REMINDER.ADD_JOB] 										: REMINDER__CORE_HANLDER.addJob,
		[CF_ACTIONS_REMINDER.ADD_JOB_MUTE_CONVERSATION] 					: REMINDER__CORE_HANLDER.addJobMuteConversation,
		[CF_ACTIONS_REMINDER.DELETE_JOB_MUTE_CONVERSATION] 					: REMINDER__CORE_HANLDER.deleteJobMuteConversation,
		[CF_ACTIONS_REMINDER.ADD_JOB_REMINDER_CONVERSATION] 				: REMINDER__CORE_HANLDER.addJobReminderConversation,
		[CF_ACTIONS_REMINDER.DELETE_JOB_REMINDER_CONVERSATION] 				: REMINDER__CORE_HANLDER.deleteJobReminderConversation,
		[CF_ACTIONS_REMINDER.ADD_JOB_AUTO_DELETE_MESSAGE_CONVERSATION] 		: REMINDER__CORE_HANLDER.addJobAutoDeleteMessageConversation,
		[CF_ACTIONS_REMINDER.DELETE_JOB_AUTO_DELETE_MESSAGE_CONVERSATION]	: REMINDER__CORE_HANLDER.deleteJobAutoDeleteMessageConversation,
		[CF_ACTIONS_REMINDER.ADD_JOB_REMINDER_EXPIRED_TASK]					: REMINDER__CORE_HANLDER.addJobReminderExpiredTask,
		[CF_ACTIONS_REMINDER.DELETE_JOB_REMINDER_EXPIRED_TASK]				: REMINDER__CORE_HANLDER.deleteJobReminderExpiredTask,
		[CF_ACTIONS_REMINDER.ADD_JOB_REFRESH_TOKEN_ZALO_OA]					: REMINDER__CORE_HANLDER.addJobRefreshTokenZaloOA,

	},

	/**
	* Events
	*/
	events: {

	},

	/**
	 	* Methods
	*/
	methods: {

	},

	/**
	 * Service created lifecycle event handler
	*/
	created() {

	},

	/**
	* Service started lifecycle event handler
	*/
	async started() {
		const runDefineTask = async () => {
			/**
			 * define all EVENT for COMSUMER
			 */

			agenda.define('update_mute_conversation', async (job, done) => {
				console.log(`========================================`);
				console.log(`done update mute conversation!!!!`);
				// console.log({ __JOB: job.attrs });

				await this.broker.call(`${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.UPDATE_MUTE_CONVERSATION}`, job.attrs.data, {
					meta: {
						infoUser: { _id: job.attrs.data.userID }
					}
				});

				done();
			});

			agenda.define('add_reminder_conversation', async (job, done) => {
				console.log(`========================================`);
				console.log(`done add reminder conversation!!!!`);
				// console.log({ __JOB: job.attrs });

				if(job.attrs.data && job.attrs.data.userID){
					const socket = require('socket.io-client')(`${process.env.SOCKET_URL}?token=${job.attrs.data.userID}&access_key=${process.env.SOCKET_ACCESS_KEY || "Y2JzX3Byb2plY3RAMjAyMQo="}`);

					socket.on("connect", () => {
						// console.log({
						// 	__MESSAGE: "Connection with the Gateway established",
						// 	__SOCKETID: socket.id,
						// 	__CONNECTED: socket.connected,
						// 	__DISCONNECTED: socket.disconnected
						// });
						socket.emit('CHATTING_CSS_NOTIFICATION_REMINDER', job.attrs.data);
						socket.disconnect();
					});
				}

				done();
			});

			agenda.define('auto_delete_message_conversation', async (job, done) => {
				await this.broker.call(`${CF_DOMAIN_SERVICES.CHATTING}.${CF_ACTIONS_CHATTING.AUTO_DELETE_MESSAGE_CONVERSATION}`, job.attrs.data, {
					meta: {
						infoUser: { _id: job.attrs.data.userID }
					}
				});

				done();
			});

			/**
			 * Kịch bản thông báo thời hạn công việc
			 */
			agenda.define('add_reminder_expired_task', async (job, done) => {
				try {
					console.log(`========================================`);
					console.log(`done reminder expired task !!!!`);
					console.log({ __JOB: job.attrs });

					const {
						taskID,
						userID,
						message,
						senderMail,
					} = job.attrs.data;

					// Call service để làm việc
					const infoTask = await this.broker.call(`${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_GET_INFO_AND_GET_LIST}`, {
						taskID
					}, {
						meta: {
							infoUser: { _id: userID }
						}
					});
					if(infoTask.error) return;

					const { name, assignee, draft } = infoTask.data;

					if(draft === 1) return done();

					const description = `Thông báo trước ${message} khi tới hạn`;
					const receivers = [assignee];

					/**
					 * VÍ DỤ CHẠY 1 API -> ĐƯA SANG BÊN KHÁC
					 * {{LOCALHOST}}/api/auth/users/login
					 */

					/**
					 * Cấu trúc data send tới Cloud MSS cho Mobile
					 */
					const dataSend = {
						app: APP_KEYS.PCM_PLAN_TASK, // Do mobile yêu cầu gửi sang
						languageKey: LANGUAGE_KEYS.REMINDER_EXPIRED_TASK, // Phân biệt ngôn ngữ
						mainColl: { // Bấm vào để truy cập vào chi tiết Task
							kind: 'pcm_plan_task',
							item: { _id: taskID }
						}
					}

					// SEND MAIL
					this.broker.call(`${CF_DOMAIN_SERVICES.SUBJECT_PCM}.${CF_ACTIONS_SUBJECT_PCM.PCM_PLAN_TASK_SEND_EMAIL_TO_MEMBER_IN_TASK}`, {
						taskID,
						title: name,
						notice: description,
						members: receivers
					}, {
						meta: {
							infoUser: { _id: userID, ...senderMail }
						}
					})

					// SEND CLOUD-MSG
					this.broker.emit("NOTIFICATION__LOG_CREATE:MOBILE_WEB", {
						users: receivers,
						title: name,
						description,
						dataSend: dataSend,
						web_url: `/pcm/detail/${taskID}`,
						env: ENV_DEVICE_WEB_CBS
					});

					done()
				} catch(err) {
					console.error(err)
				}
			})

			agenda.define('zalo_oa_refresh_token', async (job, done) => {
				try {
					console.log(`========================================`);
					console.log(`zalo_oa_refresh_token !!!!`);

					await this.broker.call(`${CF_DOMAIN_SERVICES.ZALO}.${CF_ACTIONS_ZALO.ZALO_RENEW_TOKEN}`, {
						isCache: true
					});
				} catch(error) {
					console.error(err);
				} finally {
					done();
				}
			})

			// agenda.on("success:add_reminder_expired_task", (job) => {
			// 	console.log({ __SUCCESS_REMINDER_EXPIRED_TASK: job.attrs });;
			// });

			// agenda.on("fail:add_reminder_expired_task", (err, job) => {
			// 	console.log({ __FAILED_REMINDER_EXPIRED_TASK: err.message });
			// });

			// agenda.on("complete", (job) => {
			// 	console.log({ __COMPLETED_JOB: job.attrs.name });
			// });

			await new Promise(resolve => agenda.once('ready', resolve));
			agenda.start();
		}

		/**
		 * Kết nối với DB và tạo coll jobs để lưu các sự kiện về cronTab
		 */
		const connectionOpts = {
			db: {
				address: MONGODB_URL,
				collection: process.env.AGENDA_COLLECTION || "agenda_jobs",
				options: { useNewUrlParser: true }
			},
		};
		const agenda = new Agenda(connectionOpts);

		runDefineTask().catch(error => {
			console.error({ runDefineTask_error: error });
			process.exit(-1);
		});
	},

	/**
	* Service stopped lifecycle event handler
	*/
	async stopped() { }
}