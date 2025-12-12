package com.mentalsense.backend.config;

import com.mentalsense.backend.security.JwtFilter;
import com.mentalsense.backend.security.OAuth2SuccessHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final OAuth2SuccessHandler oauth2SuccessHandler;

    public SecurityConfig(JwtFilter jwtFilter, OAuth2SuccessHandler oauth2SuccessHandler) {
        this.jwtFilter = jwtFilter;
        this.oauth2SuccessHandler = oauth2SuccessHandler;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        // Used when redirecting unauthenticated browser requests to start OAuth flow
        String oauthAuthorizeUri = "/oauth2/authorize/google";

        http
                .cors(c -> c.configurationSource(request -> {
                    // Local frontend access config
                    CorsConfiguration cfg = new CorsConfiguration();
                    cfg.setAllowedOrigins(List.of("http://localhost:5173"));
                    cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                    cfg.setAllowedHeaders(List.of("*"));
                    cfg.setAllowCredentials(true);
                    return cfg;
                }))
                .csrf(csrf -> csrf.disable())

                .authorizeHttpRequests(auth -> auth
                        // endpoints that don't require authentication
                        .requestMatchers("/auth/**", "/oauth2/**", "/login/**", "/keystroke/**").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // everything else goes through JWT authentication
                        .anyRequest().authenticated()
                )

                // OAuth flow settings for normal browser logins
                .oauth2Login(o -> o
                        .authorizationEndpoint(a -> a.baseUri("/oauth2/authorize"))
                        .redirectionEndpoint(r -> r.baseUri("/oauth2/callback/*"))
                        .successHandler(oauth2SuccessHandler)
                )

                // Decide between returning JSON (API calls) or redirecting (browser requests)
                .exceptionHandling(e -> e
                        .authenticationEntryPoint(new ApiOrRedirectAuthenticationEntryPoint(oauthAuthorizeUri))
                );

        // Ensure JWT filter runs before Spring Security’s username/password filter
        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
