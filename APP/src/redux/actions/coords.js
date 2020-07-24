import { SET_COORDS, RESET_COORDS } from "../constants/coords";

export const SetCoords = (payload) => ({
    type: SET_COORDS,
    payload
})

export const ResetCoords = () => ({
    type: RESET_COORDS
})