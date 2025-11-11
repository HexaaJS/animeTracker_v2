import axios from 'axios';

export const upgradeToPremium = async (username) => {
    const response = await axios.post('/api/auth/upgrade-premium', { username });
    return response.data;
};