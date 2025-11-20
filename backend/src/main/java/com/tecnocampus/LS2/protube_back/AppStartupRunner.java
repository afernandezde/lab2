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
import java.nio.file.Files;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

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
            final ObjectMapper mapper = new ObjectMapper();
            for (int i = 1; i <= 9; i++) {
                // find user id from repository via listAllUsers()
                var users = userService.listAllUsers();
                String ownerId = users.get(userIndex).id();
                // Default values in case metadata is missing
                String baseName = String.valueOf(i);
                String fileName = baseName + ".mp4";
                String title = baseName; // will be replaced by metadata title if available
                String description = "Description for video " + baseName;

                try {
                    if (rootPath != null) {
                        Path jsonPath = rootPath.resolve(baseName + ".json");
                        if (Files.exists(jsonPath)) {
                            var map = mapper.readValue(jsonPath.toFile(), new TypeReference<java.util.Map<String, Object>>(){});
                            Object t = map.get("title");
                            if (t instanceof String s && !s.isBlank()) {
                                title = s;
                            }
                            Object metaObj = map.get("meta");
                            if (metaObj instanceof java.util.Map<?,?> mm) {
                                Object desc = mm.get("description");
                                if (desc instanceof String ds && !ds.isBlank()) {
                                    description = ds;
                                }
                            } else {
                                Object desc = map.get("description");
                                if (desc instanceof String ds && !ds.isBlank()) {
                                    description = ds;
                                }
                            }
                        } else {
                            LOG.warn("Metadata JSON not found for video {} at {}", baseName, jsonPath);
                        }
                    }
                } catch (Exception metaEx) {
                    LOG.warn("Failed to read metadata for video {}: {}", baseName, metaEx.getMessage());
                }

                Video v = new Video(ownerId, title, description, fileName);
                Video saved = videoService.saveVideo(v);
                createdVideos.add(saved);
                LOG.info("Created video {} (id={}) by user {}", saved.getTitle(), saved.getVideoId(), ownerId);
                userIndex = (userIndex + 1) % users.size();
            }
        }
        catch (Exception e) {
            LOG.error("Error during initial data load: {}", e.getMessage());
        }
    }
}

