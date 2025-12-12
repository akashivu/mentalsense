package com.mentalsense.backend.security;

import java.io.IOException;
import java.util.Collections;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtFilter.class);

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String auth = request.getHeader("Authorization");

        if (auth != null && auth.startsWith("Bearer ")) {
            String token = auth.substring(7);

            try {
                Jws<Claims> parsed = jwtUtil.parse(token);
                Claims c = parsed.getBody();

                // Token subject carries userId
                Long userId = Long.valueOf(c.getSubject());
                String email = (String) c.get("email");

                // Minimal authentication object (no roles for now)
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userId, null, Collections.emptyList());

                // Store email in details if needed later
                authentication.setDetails(email);

                SecurityContextHolder.getContext().setAuthentication(authentication);

                // Also expose userId/email for code paths outside Spring Security
                request.setAttribute("userId", userId);
                request.setAttribute("email", email);

                log.debug("JWT valid for userId={} email={}", userId, email);

            } catch (Exception ex) {
                // Invalid token → clear context and let entry point handle 401
                log.warn("Invalid/expired JWT: {}", ex.getMessage());
                SecurityContextHolder.clearContext();
            }

        } else {
            log.debug("No Authorization header for {}", request.getRequestURI());
        }

        filterChain.doFilter(request, response);
    }
}
