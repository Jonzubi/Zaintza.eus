import { SET_COORDS, RESET_COORDS, SET_MAX_DISNTACE, RESET_MAX_DISNTACE } from "../constants/coords";

export const SetCoords = (payload) => ({
    type: SET_COORDS,
    payload
});

export const ResetCoords = () => ({
    type: RESET_COORDS
});

export const SetMaxDistance = (payload) => ({
    type: SET_MAX_DISNTACE,
    payload
})

export const ResetMaxDistance = () => ({
    type: RESET_MAX_DISNTACE,
})