package com.mentalsense.backend.config;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;

import java.io.IOException;

public class ApiOrRedirectAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final String oauthAuthorizeUri;

    public ApiOrRedirectAuthenticationEntryPoint(String oauthAuthorizeUri) {
        this.oauthAuthorizeUri = oauthAuthorizeUri;
    }

    // Detect if the incoming request expects a JSON response (API call)
    private boolean isAjaxOrJsonRequest(HttpServletRequest request) {
        String accept = request.getHeader("Accept");
        String xRequestedWith = request.getHeader("X-Requested-With");
        String contentType = request.getHeader("Content-Type");

        boolean wantsJson = accept != null && accept.contains(MediaType.APPLICATION_JSON_VALUE);
        boolean ajax = "XMLHttpRequest".equalsIgnoreCase(xRequestedWith);
        boolean contentJson = contentType != null && contentType.contains(MediaType.APPLICATION_JSON_VALUE);

        return ajax || wantsJson || contentJson;
    }

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {

        if (isAjaxOrJsonRequest(request)) {
            // API request → return 401 with JSON error instead of redirecting
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Authentication required\"}");
            response.getWriter().flush();
        } else {
            // Normal browser navigation → start OAuth login flow
            response.sendRedirect(oauthAuthorizeUri);
        }
    }
}
