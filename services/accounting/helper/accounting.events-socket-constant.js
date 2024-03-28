const ACCOUNTING = 'ACCOUNTING'

// danh sách events socket
exports.EVENT_SOCKET_CONSTANT_ACCOUNTING = {
    //========================== CLIENT SEND TO SERVER =============================
    ACCOUNTING_CSS_STATUS_UPDATE_COST_ANALYSIS: `${ACCOUNTING}_CSS_STATUS_UPDATE_COST_ANALYSIS`,

    //======================== SERVER SEND TO CLIENT ===========================
    ACCOUNTING_SSC_STATUS_UPDATE_COST_ANALYSIS: `${ACCOUNTING}_SSC_STATUS_UPDATE_COST_ANALYSIS`,
}
