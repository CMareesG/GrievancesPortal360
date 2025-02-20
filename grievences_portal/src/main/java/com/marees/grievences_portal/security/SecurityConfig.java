package com.marees.grievences_portal.security;

import com.marees.grievences_portal.config.OAuth2LoginSuccessHandler;
import com.marees.grievences_portal.models.AppRole;
import com.marees.grievences_portal.models.Role;
import com.marees.grievences_portal.models.User;
import com.marees.grievences_portal.repository.RoleRepository;
import com.marees.grievences_portal.repository.UserRepository;
import com.marees.grievences_portal.security.jwt.AuthEntryPointJwt;
import com.marees.grievences_portal.security.jwt.AuthTokenFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.provisioning.JdbcUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import javax.sql.DataSource;
import java.time.LocalDate;
import java.util.Arrays;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(
        prePostEnabled = true,
        jsr250Enabled = true,
        securedEnabled = true
)
public class SecurityConfig {
    @Autowired
    private AuthEntryPointJwt unauthorizedHandler;

    @Autowired
    @Lazy
    OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter();
    }




    @Bean
    SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf ->
                csrf.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                        .ignoringRequestMatchers("/api/auth/public/**")
        );
        //http.csrf(AbstractHttpConfigurer::disable);
        http.authorizeHttpRequests((requests)
                -> requests
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/csrf-token").permitAll()
                .requestMatchers("/api/auth/public/**").permitAll()
                .requestMatchers("/api/auth/public/signin").permitAll()
                .requestMatchers("/api/auth/public/forget-password").permitAll()
                .requestMatchers("/api/auth/public/reset-password").permitAll()
                .requestMatchers("/api/grievances/**").permitAll()
                .requestMatchers("/api/audit/**").permitAll()
                .requestMatchers("/api/grievances/{id}/toggle-solved").hasAnyRole("ADMIN","TEACHING","NONTEACHING")
                .requestMatchers("/oauth2/**").permitAll()
                .anyRequest().authenticated())
                .oauth2Login(oauth2 -> {
                    oauth2.successHandler(oAuth2LoginSuccessHandler);
                });

        http.exceptionHandling(exception
                -> exception.authenticationEntryPoint(unauthorizedHandler));
        http.addFilterBefore(authenticationJwtTokenFilter(),
                UsernamePasswordAuthenticationFilter.class);
        //http.formLogin(withDefaults());
        http.httpBasic(withDefaults());
        http.cors(
                cors -> cors.configurationSource(corsConfigurationSource())
        );
        return http.build();
    }
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        // Allow specific origins
        corsConfig.setAllowedOrigins(Arrays.asList("http://localhost:3000"));

        // Allow specific HTTP methods
        corsConfig.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        // Allow specific headers
        corsConfig.setAllowedHeaders(Arrays.asList("*"));
        // Allow credentials (cookies, authorization headers)
        corsConfig.setAllowCredentials(true);
        corsConfig.setMaxAge(3600L);
        // Define allowed paths (for all paths use "/**")
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig); // Apply to all endpoints
        return source;
    }


    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CommandLineRunner initData(RoleRepository roleRepository,
                                      UserRepository userRepository,
                                      PasswordEncoder passwordEncoder) {
        return args -> {
            Role userRole = roleRepository.findByRoleName(AppRole.ROLE_USER)
                    .orElseGet(() -> roleRepository.save(new Role(AppRole.ROLE_USER)));

            Role adminRole = roleRepository.findByRoleName(AppRole.ROLE_ADMIN)
                    .orElseGet(() -> roleRepository.save(new Role(AppRole.ROLE_ADMIN)));

            Role teachingRole = roleRepository.findByRoleName(AppRole.ROLE_TEACHING)
                    .orElseGet(() -> roleRepository.save(new Role(AppRole.ROLE_TEACHING)));

            Role nonteachingRole = roleRepository.findByRoleName(AppRole.ROLE_NONTEACHING)
                    .orElseGet(() -> roleRepository.save(new Role(AppRole.ROLE_NONTEACHING)));

            if (!userRepository.existsByUserName("user1")) {
                User user1 = new User("user1", "user1@example.com",
                        passwordEncoder.encode("password1"));
                user1.setAccountNonLocked(false);
                user1.setAccountNonExpired(true);
                user1.setCredentialsNonExpired(true);
                user1.setEnabled(true);
                user1.setCredentialsExpiryDate(LocalDate.now().plusYears(1));
                user1.setAccountExpiryDate(LocalDate.now().plusYears(1));
                user1.setTwoFactorEnabled(false);
                user1.setSignUpMethod("email");
                user1.setRole(userRole);
                userRepository.save(user1);
            }

            if (!userRepository.existsByUserName("admin")) {
                User admin = new User("admin", "admin@example.com",
                        passwordEncoder.encode("adminPass"));
                admin.setAccountNonLocked(true);
                admin.setAccountNonExpired(true);
                admin.setCredentialsNonExpired(true);
                admin.setEnabled(true);
                admin.setCredentialsExpiryDate(LocalDate.now().plusYears(1));
                admin.setAccountExpiryDate(LocalDate.now().plusYears(1));
                admin.setTwoFactorEnabled(false);
                admin.setSignUpMethod("email");
                admin.setRole(adminRole);
                userRepository.save(admin);
            }

            if (!userRepository.existsByUserName("teacher1")) {
                User teacher1 = new User("teacher1", "teacher@example.com",
                        passwordEncoder.encode("teachpassword"));
                teacher1.setAccountNonLocked(false);
                teacher1.setAccountNonExpired(true);
                teacher1.setCredentialsNonExpired(true);
                teacher1.setEnabled(true);
                teacher1.setCredentialsExpiryDate(LocalDate.now().plusYears(1));
                teacher1.setAccountExpiryDate(LocalDate.now().plusYears(1));
                teacher1.setTwoFactorEnabled(false);
                teacher1.setSignUpMethod("email");
                teacher1.setRole(teachingRole);
                userRepository.save(teacher1);
            }

            if (!userRepository.existsByUserName("nonteacher1")) {
                User nonteacher1 = new User("nonteacher1", "nonteacher@example.com",
                        passwordEncoder.encode("nonteachpassword"));
                nonteacher1.setAccountNonLocked(false);
                nonteacher1.setAccountNonExpired(true);
                nonteacher1.setCredentialsNonExpired(true);
                nonteacher1.setEnabled(true);
                nonteacher1.setCredentialsExpiryDate(LocalDate.now().plusYears(1));
                nonteacher1.setAccountExpiryDate(LocalDate.now().plusYears(1));
                nonteacher1.setTwoFactorEnabled(false);
                nonteacher1.setSignUpMethod("email");
                nonteacher1.setRole(nonteachingRole);
                userRepository.save(nonteacher1);
            }
        };
    }
}
