import axios from "axios";

const authToken = sessionStorage.getItem("auth_token");

if (authToken) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
}

const apiClient = axios.create({
  baseURL: "https://ai.uur.co.in/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ==================== QUERY APIS ====================

// Main query API
export const sendQuery = async (question, threadId = null) => {
  try {
    const requestBody = {
      question: question,
    };

    if (threadId) {
      requestBody.thread_id = threadId;
    }

    const response = await apiClient.post("/ai/query", requestBody);
    return response.data;
  } catch (error) {
    console.error("Query API Error:", error);
    throw error;
  }
};

// Follow-up API - for child nodes
export const sendFollowUp = async (question, threadId, parentNodeId) => {
  try {
    const requestBody = {
      question: question,
      thread_id: threadId,
      parent_node_id: parentNodeId,
    };

    const response = await apiClient.post("/ai/follow-up", requestBody);
    return response.data;
  } catch (error) {
    console.error("Follow-up API Error:", error);
    throw error;
  }
};

// ==================== THREAD MANAGEMENT APIS ====================

// Get all threads with pagination
export const getThreads = async (limit = 10, offset = 0) => {
  try {
    const response = await apiClient.get(
      `/ai/threads?limit=${limit}&offset=${offset}`,
    );
    return response.data;
  } catch (error) {
    console.error("Get Threads Error:", error);
    throw error;
  }
};

export const getThreadById = async (threadId) => {
  try {
    const response = await apiClient.get(`/ai/threads/${threadId}`);
    return response.data;
  } catch (error) {
    console.error("Get Thread Error:", error);
    throw error;
  }
};

export const deleteThread = async (threadId) => {
  try {
    const response = await apiClient.delete(`/ai/threads/${threadId}`);
    return response.data;
  } catch (error) {
    console.error("Delete Thread Error:", error);
    throw error;
  }
};

// ==================== HELPER FUNCTION ====================

// Transform API response to node format
export const transformResponse = (apiResponse) => {
  return {
    summary: apiResponse.summary || "No summary available",
    data: apiResponse.data || [],
    sql: apiResponse.sql_generated || null,
    followUps: apiResponse.follow_ups || apiResponse.suggested_follow_ups || [],
    chart: apiResponse.chart_suggestion
      ? {
          type: apiResponse.chart_suggestion.chart_type,
          title: apiResponse.chart_suggestion.title,
          x: apiResponse.chart_suggestion.x_axis,
          y: apiResponse.chart_suggestion.y_axis,
        }
      : null,
    metrics:
      apiResponse.data && apiResponse.data.length > 0
        ? apiResponse.data[0]
        : null,
    rowCount: apiResponse.row_count,
    executionTime: apiResponse.execution_time_ms,
    threadId: apiResponse.thread_id,
    nodeId: apiResponse.node_id,
    createdAt: apiResponse.created_at,
  };
};
