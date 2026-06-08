package com.puspo.uptime.config;

import java.security.Key;
import java.time.Duration;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

  @Value("${app.jwt.secret:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}")
  private String secretKey;

  @Value("${app.jwt.expiration:900000}") // 15 minutes
  private long jwtExpiration;

  @Value("${app.jwt.cookie-name:uptime_token}")
  private String cookieName;

  @Value("${app.cors.allowed.origins:*}")
  private String allowedOrigins;

  public String extractUsername(String token) {
    return extractClaim(token, Claims::getSubject);
  }

  public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
    final Claims claims = extractAllClaims(token);
    return claimsResolver.apply(claims);
  }

  public String generateToken(UserDetails userDetails) {
    return generateToken(new HashMap<>(), userDetails);
  }

  public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
    return buildToken(extraClaims, userDetails, jwtExpiration);
  }

  private String buildToken(Map<String, Object> extraClaims, UserDetails userDetails, long expiration) {
    return Jwts
        .builder()
        .setClaims(extraClaims)
        .setSubject(userDetails.getUsername())
        .setIssuedAt(new Date(System.currentTimeMillis()))
        .setExpiration(new Date(System.currentTimeMillis() + expiration))
        .signWith(getSignInKey(), SignatureAlgorithm.HS256)
        .compact();
  }

  public boolean isTokenValid(String token, UserDetails userDetails) {
    final String username = extractUsername(token);
    return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
  }

  private boolean isTokenExpired(String token) {
    return extractExpiration(token).before(new Date());
  }

  private Date extractExpiration(String token) {
    return extractClaim(token, Claims::getExpiration);
  }

  private Claims extractAllClaims(String token) {
    return Jwts
        .parserBuilder()
        .setSigningKey(getSignInKey())
        .build()
        .parseClaimsJws(token)
        .getBody();
  }

  private Key getSignInKey() {
    byte[] keyBytes = Decoders.BASE64.decode(secretKey);
    return Keys.hmacShaKeyFor(keyBytes);
  }

  /**
   * Extract JWT from request cookies.
   */
  public String extractTokenFromCookies(Cookie[] cookies) {
    if (cookies == null) return null;
    for (Cookie cookie : cookies) {
      if (cookieName.equals(cookie.getName())) {
        return cookie.getValue();
      }
    }
    return null;
  }

  /**
   * Set JWT as an httpOnly cookie on the response.
   * Uses SameSite=Lax for CSRF protection.
   */
  public void setTokenCookie(HttpServletResponse response, String token) {
    Cookie cookie = new Cookie(cookieName, token);
    cookie.setHttpOnly(true);
    cookie.setSecure(!"*".equals(allowedOrigins) && !allowedOrigins.contains("localhost"));
    cookie.setPath("/");
    cookie.setMaxAge((int) Duration.ofMillis(jwtExpiration).toSeconds());
    cookie.setAttribute("SameSite", "Lax");
    response.addCookie(cookie);
  }

  /**
   * Clear the auth cookie (for logout).
   */
  public void clearTokenCookie(HttpServletResponse response) {
    Cookie cookie = new Cookie(cookieName, "");
    cookie.setHttpOnly(true);
    cookie.setPath("/");
    cookie.setMaxAge(0);
    response.addCookie(cookie);
  }
}
