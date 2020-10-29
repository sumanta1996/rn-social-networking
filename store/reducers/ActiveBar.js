import { SET_ACTIVITY } from "../actions/ActiveBar"

const initialState = {
    active: 'HomepageFeed'
}

export default (state = initialState, action) => {
    switch(action.type) {
        case SET_ACTIVITY: 
            return {
                ...state,
                active: action.active
            }
        default: return state;
    }
}