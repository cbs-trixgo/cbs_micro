/**
 * Dev: HuynhVinh
 * Updated: MinhVH
 */
exports.renderStatusCodeAndResponse = function ({
  resultAfterCallHandler,
  ctx,
  error_message,
}) {
  let error = {}

  if (resultAfterCallHandler && resultAfterCallHandler.error) {
    error = {
      data: {
        message: resultAfterCallHandler.message,
        keyError:
          resultAfterCallHandler.keyError || 'result_after_call_handler',
      },
    }
  }

  if (error_message) {
    error = {
      data: {
        message: error_message,
        keyError: 'server_error',
      },
    }
  }

  const status =
    resultAfterCallHandler && resultAfterCallHandler.status
      ? resultAfterCallHandler.status
      : 400
  const statusMessage =
    resultAfterCallHandler && resultAfterCallHandler.statusMessage
      ? resultAfterCallHandler.statusMessage
      : 'success'

  if (Object.keys(error).length) {
    ctx.meta.$statusCode = status
    ctx.meta.$statusMessage = statusMessage

    return { error: true, status: ctx.meta.$statusCode, ...error }
  }

  ctx.meta.$statusCode = 200
  ctx.meta.$statusMessage = statusMessage

  return resultAfterCallHandler
}
