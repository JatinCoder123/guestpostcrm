import axios from 'axios';
import { MOVE_END_POINT } from '../store/constants';

const BASE_URL = MOVE_END_POINT


export const getMoveOptions = async () => {
  try {
    const response = await axios.get(`${BASE_URL}?entryPoint=move`);
    return response.data;
  } catch (error) {
    console.error('Error fetching move options:', error);
    throw error;
  }
};


export const moveData = async (threadId, labelId) => {
  try {
    const response = await axios.post(
      `${BASE_URL}?entryPoint=move&threadid=${threadId}&lblid=${labelId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error moving data:', error);
    throw error;
  }
};