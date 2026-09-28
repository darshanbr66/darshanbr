const mongoose = require('mongoose')
const { pick } = require('./sanitize')

function notFoundError(label) {
  const error = new Error(`${label} not found`)
  error.status = 404
  return error
}

// Builds the standard list/create/update/delete/reorder handlers shared by
// skills, experience and projects. `prepare` can validate/normalize input.
function createCrud(Model, { label, fields, prepare = (data) => data }) {
  return {
    async listPublic(req, res) {
      const items = await Model.find({ status: 'published' }).sort({ order: 1, createdAt: 1 }).lean()
      res.set('Cache-Control', 'no-cache')
      res.json(items)
    },

    async listAll(req, res) {
      const items = await Model.find().sort({ order: 1, createdAt: 1 }).lean()
      res.json(items)
    },

    async create(req, res) {
      const data = await prepare(pick(req.body, fields), null)
      if (data.order === undefined) {
        const last = await Model.findOne().sort({ order: -1 }).select('order').lean()
        data.order = (last?.order ?? 0) + 1
      }
      const item = await Model.create(data)
      res.status(201).json(item)
    },

    async update(req, res) {
      const item = await Model.findById(req.params.id)
      if (!item) throw notFoundError(label)
      const data = await prepare(pick(req.body, fields), item)
      item.set(data)
      await item.save()
      res.json(item)
    },

    async remove(req, res) {
      const item = await Model.findByIdAndDelete(req.params.id)
      if (!item) throw notFoundError(label)
      res.json({ message: `${label} deleted`, id: item._id })
    },

    // Body: { ids: [...] } in the desired order.
    async reorder(req, res) {
      const ids = Array.isArray(req.body?.ids) ? req.body.ids : null
      if (!ids || ids.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
        return res.status(400).json({ message: 'ids must be an array of record ids' })
      }
      await Model.bulkWrite(
        ids.map((id, index) => ({
          updateOne: { filter: { _id: id }, update: { $set: { order: index + 1 } } },
        }))
      )
      const items = await Model.find().sort({ order: 1, createdAt: 1 }).lean()
      res.json(items)
    },
  }
}

module.exports = { createCrud, notFoundError }
