const Agenda = require('agenda')
const { MONGODB_URL } = require('../db/utils')

const connectionOpts = {
  db: {
    address: MONGODB_URL,
    collection: process.env.AGENDA_COLLECTION || 'agenda_jobs',
    options: { useNewUrlParser: true },
  },
}
module.exports = new Agenda(connectionOpts)
