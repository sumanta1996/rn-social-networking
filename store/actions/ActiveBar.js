export const SET_ACTIVITY = 'SET_ACTIVITY';

export const setActivity = active => {
    return {
        type: SET_ACTIVITY,
        active: active
    }
}