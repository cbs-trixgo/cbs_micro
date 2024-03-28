'use strict'

const path = require('path')
const mkdir = require('mkdirp').sync

const DbService = require('moleculer-db')
const { isProd } = require('../utils/utils')
const { MONGODB_URL } = require('../db/utils')

module.exports = function (collection) {
  const MongoAdapter = require('moleculer-db-adapter-mongoose')
  if (isProd()) {
    return {
      mixins: [DbService],
      adapter: new MongoAdapter(MONGODB_URL, {
        timestamps: false,
      }),
      model: collection,
      methods: {
        fixStringToId(idString) {
          if (typeof this.adapter.stringToObjectID !== 'undefined') {
            return this.adapter.stringToObjectID(idString)
          }
          return idString
        },
      },
    }
  } else {
    if (MONGODB_URL) {
      // Mongo adapter

      return {
        mixins: [DbService],
        adapter: new MongoAdapter(MONGODB_URL, {
          timestamps: false,
        }),
        model: collection,
        methods: {
          fixStringToId(idString) {
            if (typeof this.adapter.stringToObjectID !== 'undefined') {
              return this.adapter.stringToObjectID(idString)
            }
            return idString
          },
        },
      }
    }

    // --- NeDB fallback DB adapter

    // Create data folder
    mkdir(path.resolve('../data'))

    return {
      mixins: [DbService],
      adapter: new DbService.MemoryAdapter({
        filename: `../data/${collection}.db`,
      }),

      methods: {
        entityChanged(type, json, ctx) {
          return this.clearCache().then(() => {
            const eventName = `${this.name}.entity.${type}`
            this.broker.emit(eventName, {
              meta: ctx.meta,
              entity: json,
            })
          })
        },
        fixStringToId(idString) {
          return idString
        },
      },
    }
  }
}
