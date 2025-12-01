package com.tecnocampus.LS2.protube_back.repository;

import com.tecnocampus.LS2.protube_back.domain.Video;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface VideoRepository extends JpaRepository<Video, String> {   
    Optional<Video> findByFileName(String fileName);
    java.util.List<Video> findByFileNameStartingWith(String prefix);
}
