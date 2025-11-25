package com.tecnocampus.LS2.protube_back.repository;

import com.tecnocampus.LS2.protube_back.domain.Video;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface VideoRepository extends JpaRepository<Video, String> {   
    <S extends Video> S save(S video);
    List<Video> findAll();
    Optional<Video> findById(String id);
    Optional<Video> findByFileName(String fileName);
}
