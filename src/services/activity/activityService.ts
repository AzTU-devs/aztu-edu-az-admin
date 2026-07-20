import apiClient from "../../util/apiClient";
import type {
  ActivityFilters,
  ActivityFiltersResponse,
  ActivityItem,
  ActivityListQuery,
  ActivityListResponse,
  Paginated,
} from "../../types/rbac";

/**
 * The activity endpoints page with `page`/`page_size` and carry a `total`, unlike
 * the `start`/`end` slicing used elsewhere — the log needs a real pager.
 */
const activityService = {
  list: async (query: ActivityListQuery = {}): Promise<Paginated<ActivityItem>> => {
    const response = await apiClient.get<ActivityListResponse>("/api/activity", {
      params: query,
    });
    return response.data.data;
  },

  /** Populates every filter dropdown in one call. */
  getFilters: async (): Promise<ActivityFilters> => {
    const response = await apiClient.get<ActivityFiltersResponse>("/api/activity/filters");
    return response.data.data;
  },
};

export default activityService;
