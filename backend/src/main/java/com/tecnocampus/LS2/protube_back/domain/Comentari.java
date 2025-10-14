package com.tecnocampus.LS2.protube_back.domain;

/**
 * Domain model for a comment (Comentari).
 * Fields: id, userId, videoId, titulo, descripcion
 */
public class Comentari {
	private String id;
	private String userId;
	private String videoId;
	private String titulo;
	private String descripcion;

	public Comentari() {
	}

	public Comentari(String id, String userId, String videoId, String titulo, String descripcion) {
		this.id = id;
		this.userId = userId;
		this.videoId = videoId;
		this.titulo = titulo;
		this.descripcion = descripcion;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

	public String getVideoId() {
		return videoId;
	}

	public void setVideoId(String videoId) {
		this.videoId = videoId;
	}

	public String getTitulo() {
		return titulo;
	}

	public void setTitulo(String titulo) {
		this.titulo = titulo;
	}

	public String getDescripcion() {
		return descripcion;
	}

	public void setDescripcion(String descripcion) {
		this.descripcion = descripcion;
	}

	@Override
	public String toString() {
		return "Comentari{" +
				"id='" + id + '\'' +
				", userId='" + userId + '\'' +
				", videoId='" + videoId + '\'' +
				", titulo='" + titulo + '\'' +
				", descripcion='" + descripcion + '\'' +
				'}';
	}
}
