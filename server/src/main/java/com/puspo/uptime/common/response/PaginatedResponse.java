package com.puspo.uptime.common.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class PaginatedResponse<T> {

    private List<T> data;
    private Pagination pagination;

    @Getter
    @Builder
    public static class Pagination {
        private int page;
        private int pageSize;
        private long totalItems;
        private int totalPages;
        private boolean hasNext;
        private boolean hasPrev;
    }
}
