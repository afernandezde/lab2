package com.tecnocampus.LS2.protube_back;

import com.tecnocampus.LS2.protube_back.services.VideoService;
import com.tecnocampus.LS2.protube_back.services.UserService;
import com.tecnocampus.LS2.protube_back.services.ComentariService;
import com.tecnocampus.LS2.protube_back.domain.Video;
import com.tecnocampus.LS2.protube_back.controller.dto.ComentariDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.nio.file.Path;
import java.nio.file.Paths;

@Component
public class AppStartupRunner implements ApplicationRunner {
    private static final Logger LOG =
            LoggerFactory.getLogger(AppStartupRunner.class);

    @Autowired
    VideoService videoService;

    @Autowired
    UserService userService;

    @Autowired
    ComentariService comentariService;

    // Example variables from our implementation. 
    // Feel free to adapt them to your needs
    private final Environment env;
    private final Path rootPath;
    private final Boolean loadInitialData;

    public AppStartupRunner(Environment env) {
        this.env = env;
        final var rootDir = env.getProperty("pro_tube.store.dir");
        this.rootPath = Paths.get(rootDir);
        loadInitialData = env.getProperty("pro_tube.load_initial_data", Boolean.class);


    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        // Load sample data if configured to do so (default true)
        boolean shouldLoad = Boolean.TRUE.equals(loadInitialData) || loadInitialData == null;
        if (!shouldLoad) {
            LOG.info("Skipping initial data load (pro_tube.load_initial_data=false)");
            return;
        }
        try {
            // Create 5 users
            String[] usernames = {"alice","bob","carol","dave","eve"};
            String[] emails = {"alice@example.com","bob@example.com","carol@example.com","dave@example.com","eve@example.com"};
            String[] passwords = {"pass1","pass2","pass3","pass4","pass5"};
            for (int i = 0; i < usernames.length; i++) {
                try {
                    userService.register(usernames[i], emails[i], passwords[i]);
                    LOG.info("Registered user {} -> success", usernames[i]);
                } catch (RuntimeException ex) {
                    LOG.warn("Failed to register user {}: {}", usernames[i], ex.getMessage());
                }
            }

            // Create 9 videos distributed among users
            java.util.List<Video> createdVideos = new java.util.ArrayList<>();
            int userIndex = 0;
            for (int i = 1; i <= 12; i++) {
                // find user id from repository via listAllUsers()
                var users = userService.listAllUsers();
                String ownerId = users.get(userIndex).id();
                Video v = new Video(ownerId,"" + i, "Description for video " + i, i + ".mp4");
                Video saved = videoService.saveVideo(v);
                createdVideos.add(saved);
                LOG.info("Created video {} (id={}) by user {}", saved.getTitle(), saved.getVideoId(), ownerId);
                userIndex = (userIndex + 1) % users.size();
            }

            // For each video create 3 comments using rotating users
            var usersList = userService.listAllUsers();
            for (Video vid : createdVideos) {
                for (int c = 1; c <= 3; c++) {
                    var commenter = usersList.get((c - 1) % usersList.size());
                    ComentariDTO commentDto = new ComentariDTO(null, commenter.id(), vid.getVideoId(), "Comment " + c + " on " + vid.getTitle(), "This is comment number " + c + " for " + vid.getTitle());
                    try {
                        comentariService.create(commentDto, commenter.id());
                        LOG.info("Created comment by {} on video {}", commenter.id(), vid.getVideoId());
                    } catch (Exception ex) {
                        LOG.warn("Failed to create comment for video {}: {}", vid.getVideoId(), ex.getMessage());
                    }
                }
            }
        } catch (Exception e) {
            LOG.error("Error loading initial data: {}", e.getMessage(), e);
        }
    }
}
