"use strict";

require('dotenv').config();

let	ApiGateway 				= require("moleculer-web"),
	express         		= require('express'),
	path         		    = require('path'),
	app               		= express(),
	server            		= require('http').Server(app),
	apiV1 					= require("./auth.alias"), // config api
	apiNonAuthV1 			= require("./non-auth.alias"); // config api

const { CF_DOMAIN_SERVICES } 	        = require('./helper/domain.constant');
const { CF_ACTIONS_GATEWAY } 	        = require('./helper/gateway.actions-constant');
const { CF_ACTIONS_AUTH } 	        	= require('../auth/helper/auth.actions-constant');
const GATEWAY__HANDLER      			= require('./handler/gateway.handler');

module.exports = {
	name: CF_DOMAIN_SERVICES.GATEWAY,
	mixins: [
		ApiGateway,
	],
	settings: {
		// Exposed port
		port: process.env.PORT || 3003,
		// Exposed IP
		ip: "0.0.0.0",

		/**
		 * MIDDLEWARE GLOBAL
		 */
		// Global Express middlewares. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Middlewares
		use: [
    		express.static(path.join(__dirname, "public")),
		],

		cors: {
			// Configures the Access-Control-Allow-Origin CORS header.
			origin: "*",
			// Configures the Access-Control-Allow-Methods CORS header.
			methods: ["GET", "OPTIONS", "POST", "PUT", "DELETE"],
			// Configures the Access-Control-Allow-Headers CORS header.
			allowedHeaders: ['X-Requested-With', 'content-type', 'Authorization'],
			// Configures the Access-Control-Expose-Headers CORS header.
			exposedHeaders: [],
			// Configures the Access-Control-Allow-Credentials CORS header.
			credentials: true,
			// Configures the Access-Control-Max-Age CORS header.
			maxAge: 3600
        },
		routes: [
			// get routes from external file - merged with subproject if applicable
			// sppf.subprojectMergeRoutes(apiV1, path.resolve(resourcesDirectory+"/routes/apiV1") ),
			apiV1, // routing
			apiNonAuthV1,
		],

		// Do not log client side errors (does not log an error response when the error.code is 400<=X<500)
		log4XXResponses: false,
		// Logging the request parameters. Set to any log level to enable it. E.g. "info"
		logRequestParams: null,
		// Logging the response data. Set to any log level to enable it. E.g. "info"
		logResponseData: null,

		// Serve assets from "public" folder. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Serve-static-files
		assets: {
			folder: "public",
			// Options to `server-static` module
			options: {}
		}
	},

	dependencies: [
		CF_DOMAIN_SERVICES.AUTH,
	],

	/**
	* Actions HEALTH/VERSION
	*/
	actions: {
		[CF_ACTIONS_GATEWAY.CHECK_HEALTH] 			: GATEWAY__HANDLER.checkHealth,
		[CF_ACTIONS_GATEWAY.CHECK_VERSION] 			: GATEWAY__HANDLER.checkVersion,
	},

	methods: {
		initRoutes(app) {
			app.get('/', function(req,res) {
				res.redirect('/ui');
			});
		},

		// async authenticate(ctx, route, req, res) {
		// 	try {
		// 		let accessToken = req.headers[ 'x-access-token' ] || req.headers.token || null;
		// 		if(accessToken){

		// 			let resolveToken = null;
		// 			// let resolveToken = await ctx.call(`${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.RESOLVE_TOKEN}`, { token: accessToken })
		// 			if(resolveToken.error){
		// 				return Promise.reject(resolveToken.message);
		// 			}
		// 			return Promise.resolve(null)
		// 		}
		// 		else{
		// 			return Promise.reject('redirect_url_clear_session');
		// 		}
		// 	} catch (error) {
		// 		return Promise.reject(error);
		// 	}
        // },

		/**
		 * Authorize the request
		 *
		 * @param {Context} ctx
		 * @param {Object} route
		 * @param {IncomingRequest} req
		 * @returns {Promise}
		 */
		async authorize(ctx, _, req) {
			let token;
			if (req.headers.authorization) {
				let type = req.headers.authorization.split(" ")[0];
				if (type === "Token" || type === "Bearer")
					token = req.headers.authorization.split(" ")[1];
			}

			try {
				let checkAuthorization = await ctx.call(`${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.RESOLVE_TOKEN}`, { token });

				if(checkAuthorization.error){
					return Promise.reject(checkAuthorization.message);
				}

				if(!checkAuthorization.data) {
					return Promise.reject('Unauthorized');
				}

				const { infoUser, exp } = checkAuthorization.data;

				// if(exp < Date.now()) {
				// 	return Promise.reject('Token is expired');
				// }

				this.logger.info("Authenticated via JWT: ", infoUser.username, exp);

				// Reduce user fields (it will be transferred to other nodes)
				ctx.meta.infoUser = infoUser;
				ctx.meta.token 	  = token;

				let userAuth = await ctx.call(`${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.USER_GET_INFO_AND_GET_LIST}`, {
					userID: infoUser._id.toString(),
					select: "status",
					populates: JSON.stringify({
						path: "company",
						select: "_id"
					})
				});

				if(!userAuth.error) {
					userAuth = userAuth.data;

					if(userAuth.status === 0) {
						return Promise.reject('user_blocked');
					}
				}

				return infoUser;
			} catch (error) {
				console.error(error);
				return Promise.reject(error.message)
			}

			// return console.log({ checkAuthorization, [`${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.RESOLVE_TOKEN}`]: `${CF_DOMAIN_SERVICES.AUTH}.${CF_ACTIONS_AUTH.RESOLVE_TOKEN}` })

			// return this.Promise.resolve(token)
			// 	.then(token => {
			// 		if (token) {
			// 			// Verify JWT token
			// 			return ctx.call("users.resolveToken", { token })
			// 				.then(user => {
			// 					if (user) {
			// 						this.logger.info("Authenticated via JWT: ", user.username);
			// 						// Reduce user fields (it will be transferred to other nodes)
			// 						ctx.meta.user = _.pick(user, ["_id", "username", "email", "image"]);
			// 						ctx.meta.token = token;
			// 					}
			// 					return user;
			// 				})
			// 				.catch(err => {
			// 					// Ignored because we continue processing if user is not exist
			// 					return null;
			// 				});
			// 		}
			// 	})
			// 	.then(user => {
			// 		if (req.$endpoint.action.auth == "required" && !user)
			// 			return this.Promise.reject(new UnAuthorizedError());
			// 	});
		},
	},

	// some lifecycle
	created() {},
	started() {},
	stopped() {
		if (this.app.listening) {
			this.app.close(err => {
				if (err)
					return this.logger.error("WWW server close error!", err);

				this.logger.info("WWW server stopped!");
			});
		}
	}
};
