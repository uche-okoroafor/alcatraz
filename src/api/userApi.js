import axios from "axios";
import { SERVER_URL } from "../endpoints";

const API_BASE_URL = SERVER_URL;

const userApi = {

    validateTradeLive: async (data) => {
        return await axios.post(`${SERVER_URL}/user/validateTradeLive`, data);
    }
};

export default userApi;