package com.mentalsense.backend.controller;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
public class OAuthController {

    @GetMapping("/oauth2/authorize/google")
    public void redirectToGoogle(HttpServletResponse response) throws IOException {
        String clientId = "455506268332-dbreft158egqll0g88ukom2jg4i8tcr8.apps.googleusercontent.com";
        String redirectUri = URLEncoder.encode("http://localhost:8080/oauth2/callback/google", StandardCharsets.UTF_8);
        String scope = URLEncoder.encode("openid profile email", StandardCharsets.UTF_8);
        String state = "someGeneratedState"; // generate per-session
        String nonce = "someNonce"; // optionally generate

        String url = "https://accounts.google.com/o/oauth2/v2/auth"
                + "?response_type=code"
                + "&client_id=" + clientId
                + "&scope=" + scope
                + "&redirect_uri=" + redirectUri
                + "&state=" + state
                + "&nonce=" + nonce;

        response.sendRedirect(url);
    }
}

