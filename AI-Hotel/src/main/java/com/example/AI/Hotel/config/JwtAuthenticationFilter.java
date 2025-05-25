package com.example.AI.Hotel.config;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;
    private final List<String> excludedPaths = Arrays.asList("/auth/**", "/login/oauth2/**", "/getAll/**");

    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String uri = request.getRequestURI();
        // Bỏ qua các đường dẫn không yêu cầu xác thực
        boolean isExcluded = uri.startsWith("/auth") || uri.startsWith("/auth/register") ||uri.startsWith("/login/oauth2") || uri.startsWith("/getAll") || uri.startsWith("/hotels")  || uri.startsWith("/places") || uri.startsWith("/rooms");
        return isExcluded;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        if (shouldNotFilter(request)) {
            chain.doFilter(request, response);
            return;
        }

        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"message\":\"Missing or invalid token format\", \"status\":401}");
            return;
        }

        String token = header.substring(7);
        System.out.println("Received token: " + token);

        try {
            if (jwtUtil.validateToken(token)) {
                String email = jwtUtil.getEmailFromToken(token);
                System.out.println("Extracted email from token: " + email);
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                System.out.println("UserDetails loaded: " + userDetails);
                if (userDetails == null) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("{\"message\":\"User not found for email: " + email + "\", \"status\":401}");
                    return;
                }

                if (!userDetails.isEnabled() || !userDetails.isAccountNonLocked()) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("{\"message\":\"Account is disabled\", \"status\":401}");
                    return;
                }

                var authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
                System.out.println("Authenticated user: " + email + ", authorities: " + userDetails.getAuthorities());
            } else {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"message\":\"Invalid token\", \"status\":401}");
                return;
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"message\":\"Authentication failed: " + e.getMessage() + "\", \"status\":401}");
            return;
        }

        chain.doFilter(request, response);
    }
}