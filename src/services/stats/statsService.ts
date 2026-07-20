import apiClient from "../../util/apiClient";
import type {
  DashboardStats,
  DashboardStatsQuery,
  DashboardStatsResponse,
} from "../../types/stats";

/**
 * The dashboard aggregate is a single call — counts, the 12-month publishing
 * trend, the visitor windows and the recent admin activity all arrive together,
 * so the home screen never fans out one request per tile.
 */
const statsService = {
  getDashboard: async (query: DashboardStatsQuery = {}): Promise<DashboardStats> => {
    const response = await apiClient.get<DashboardStatsResponse>("/api/stats/dashboard", {
      params: query,
    });
    return response.data.data;
  },
};

export default statsService;
