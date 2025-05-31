const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.MODE === "production"
    ? "https://minenearme-backend.onrender.com/api"
    : "http://localhost:3000/api");

export interface Comment {
  _id: string;
  caseId: string;
  author: string;
  avatar?: string;
  text: string;
  likes: number;
  likedBy: string[];
  createdAt: string;
  updatedAt: string;
  age: string;
}

export interface CommentResponse {
  success: boolean;
  data: {
    comments: Comment[];
    pagination: {
      current: number;
      total: number;
      count: number;
      totalComments: number;
    };
  };
  message?: string;
}

export interface CreateCommentRequest {
  author?: string;
  text: string;
  avatar?: string;
}

export interface CreateCommentResponse {
  success: boolean;
  data: Comment;
  message: string;
}

export interface LikeCommentResponse {
  success: boolean;
  data: {
    likes: number;
    hasLiked: boolean;
  };
  message: string;
}

export interface CommentStatsResponse {
  success: boolean;
  data: {
    totalComments: number;
    totalLikes: number;
    avgLikes: number;
  };
}

class CommentsApi {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}/comments${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Get comments for a specific case
  async getCommentsByCase(
    caseId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<CommentResponse> {
    return this.request<CommentResponse>(
      `/${caseId}?page=${page}&limit=${limit}`
    );
  }

  // Create a new comment
  async createComment(
    caseId: string,
    commentData: CreateCommentRequest
  ): Promise<CreateCommentResponse> {
    return this.request<CreateCommentResponse>(`/${caseId}`, {
      method: "POST",
      body: JSON.stringify(commentData),
    });
  }

  // Like or unlike a comment
  async likeComment(commentId: string): Promise<LikeCommentResponse> {
    return this.request<LikeCommentResponse>(`/${commentId}/like`, {
      method: "PUT",
    });
  }

  // Get comment statistics for a case
  async getCommentStats(caseId: string): Promise<CommentStatsResponse> {
    return this.request<CommentStatsResponse>(`/${caseId}/stats`);
  }

  // Delete a comment (admin only)
  async deleteComment(
    commentId: string
  ): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(
      `/${commentId}`,
      {
        method: "DELETE",
      }
    );
  }
}

export const commentsApi = new CommentsApi();
