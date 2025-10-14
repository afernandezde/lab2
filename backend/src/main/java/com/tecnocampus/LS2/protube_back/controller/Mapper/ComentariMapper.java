package com.tecnocampus.LS2.protube_back.controller.Mapper;

import com.tecnocampus.LS2.protube_back.Domain.Comentari;
import com.tecnocampus.LS2.protube_back.controller.DTO.ComentariDTO;

public class ComentariMapper {

	public static ComentariDTO toDto(Comentari c) {
		if (c == null) return null;
		return new ComentariDTO(c.getId(), c.getUserId(), c.getVideoId(), c.getTitulo(), c.getDescripcion());
	}

	public static Comentari toEntity(ComentariDTO dto) {
		if (dto == null) return null;
		return new Comentari(dto.id(), dto.userId(), dto.videoId(), dto.titulo(), dto.descripcion());
	}
}
