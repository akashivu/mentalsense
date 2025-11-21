package com.mentalsense.backend.security;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;

@Component
public class JwtFilter implements Filter {

    @Autowired
    private  JwtUtil jwtUtil;


    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) req;
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) {
            String token = auth.substring(7);
            try {
                Jws<Claims> parsed = jwtUtil.parse(token);
                Claims c = parsed.getBody();
                request.setAttribute("userId", Long.valueOf(c.getSubject()));
                request.setAttribute("email", c.get("email"));
            } catch (Exception e) {
                // invalid token: do not set userId
            }
        }
        chain.doFilter(req, res);
    }
}
