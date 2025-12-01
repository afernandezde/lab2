package com.tecnocampus.LS2.protube_back.controller.dto;

import java.util.List;

public record PlaylistDTO(String id, String name, String userId, List<String> videoIds) {
}
