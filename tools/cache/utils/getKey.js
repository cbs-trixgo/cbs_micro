const GET_KEY_LATEST_TASKS              = userID => `USER:${userID}:TASKS`;
const GET_KEY_LATEST_DEPARTMENTS        = userID => `USER:${userID}:DEPARTMENTS`;

module.exports = {
    GET_KEY_LATEST_TASKS, 
    GET_KEY_LATEST_DEPARTMENTS
}