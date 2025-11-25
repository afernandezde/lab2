package com.tecnocampus.LS2.protube_back.controller.dto;

public record VideoViewDTO(String id, String userId, String videoFileName, String title, String description, long viewedAt) {
}