package com.tecnocampus.LS2.protube_back.controller.mapper;

import com.tecnocampus.LS2.protube_back.controller.dto.VideoViewDTO;
import com.tecnocampus.LS2.protube_back.domain.VideoView;
import com.tecnocampus.LS2.protube_back.domain.Video;

public class VideoViewMapper {
    public static VideoViewDTO toDTO(VideoView view, Video video) {
        return new VideoViewDTO(
                view.getId(),
                view.getUserId(),
                view.getVideoFileName(),
                video != null ? video.getTitle() : view.getVideoFileName(),
                video != null ? video.getDescription() : "",
                view.getViewedAt()
        );
    }
}