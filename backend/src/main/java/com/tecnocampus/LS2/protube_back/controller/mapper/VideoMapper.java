package com.tecnocampus.LS2.protube_back.controller.mapper;

import com.tecnocampus.LS2.protube_back.controller.dto.videoSaveDTO;
import com.tecnocampus.LS2.protube_back.domain.Video;

public class VideoMapper {
    public static Video toVideo(videoSaveDTO dto) {
        return new Video(dto.userId(), dto.title(), dto.description(), dto.fileName());
    }
}
