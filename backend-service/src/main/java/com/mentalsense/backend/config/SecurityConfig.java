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

        String oauthAuthorizeUri = "/oauth2/authorize/google";

        http
                // ================= CORS =================
                .cors(cors -> cors.configurationSource(request -> {
                    CorsConfiguration cfg = new CorsConfiguration();
                    cfg.setAllowedOrigins(List.of(
                            "http://localhost:5173",
                            "https://mentalsense.netlify.app"
                    ));
                    cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                    cfg.setAllowedHeaders(List.of("*"));
                    cfg.setAllowCredentials(true);
                    return cfg;
                }))

                // ================= CSRF =================
                .csrf(csrf -> csrf.disable())

                // ================= AUTHORIZATION =================
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/auth/**", "/oauth2/**", "/login/**").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Keystroke logging MUST be authenticated
                        .requestMatchers(HttpMethod.POST, "/keystroke/log").authenticated()

                        // Everything else requires JWT
                        .anyRequest().authenticated()
                )

                // ================= OAUTH2 LOGIN =================
                .oauth2Login(oauth -> oauth
                        .authorizationEndpoint(a -> a.baseUri("/oauth2/authorize"))
                        .redirectionEndpoint(r -> r.baseUri("/oauth2/callback/*"))
                        .successHandler(oauth2SuccessHandler)
                )

                // ================= AUTH ENTRY =================
                .exceptionHandling(e -> e
                        .authenticationEntryPoint(
                                new ApiOrRedirectAuthenticationEntryPoint(oauthAuthorizeUri)
                        )
                );

        // ================= JWT FILTER =================
        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
