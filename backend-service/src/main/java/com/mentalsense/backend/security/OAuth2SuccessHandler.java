package com.mentalsense.backend.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final OAuthUserService oauthUserService;

    public OAuth2SuccessHandler(JwtUtil jwtUtil, OAuthUserService oauthUserService) {
        this.jwtUtil = jwtUtil;
        this.oauthUserService = oauthUserService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        try {
            // OAuth2 login gives us an OAuth2User with Google profile attributes
            OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();

            // Google normally provides email in attributes
            String email = (String) oauthUser.getAttributes().get("email");
            Map<String, Object> attributes = oauthUser.getAttributes();

            // Find existing user or create a new one for this Google account
            Long userId = oauthUserService.findOrCreateOAuthUser(email, attributes);

            // Issue JWT so frontend can store and use it like normal login
            String jwt = jwtUtil.generateToken(userId, email);

            // Frontend route expected to capture token from URL
            String frontendBase = "http://localhost:5173"; // update for production
            String redirectUrl = frontendBase + "/#/auth/success?token=" +
                    URLEncoder.encode(jwt, StandardCharsets.UTF_8) +
                    "&userId=" + userId;

            response.sendRedirect(redirectUrl);

        } catch (Exception e) {
            // On any unexpected error, send user to a simple failure page
            e.printStackTrace();
            try {
                response.sendRedirect("http://localhost:5173/#/auth/failure");
            } catch (IOException ignored) {}
        }
    }
}
