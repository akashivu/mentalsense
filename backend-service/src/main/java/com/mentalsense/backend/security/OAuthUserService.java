package com.mentalsense.backend.security;

import com.mentalsense.backend.model.User;
import com.mentalsense.backend.repo.UserRepo;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class OAuthUserService {

    private final UserRepo userRepo;

    public OAuthUserService(UserRepo userRepo) {
        this.userRepo = userRepo;
    }

    public Long findOrCreateOAuthUser(String email, Map<String, Object> attributes) {

        // If user exists, return its id
        return userRepo.findByEmail(email)
                .map(User::getId)
                .orElseGet(() -> {
                    // Creste new user
                    User newUser = new User();
                    newUser.setEmail(email);

                    Object name = attributes.get("name");
                    if (name != null) newUser.setName(String.valueOf(name));

                    Object picture = attributes.get("picture");
                    if (picture != null) newUser.setAvatar(String.valueOf(picture));

                    newUser.setAuthProvider("GOOGLE");

                    User saved = userRepo.save(newUser);
                    return saved.getId();
                });
    }
}
