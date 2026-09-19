package com.nexoffer.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DriverManager;

@Configuration
public class DataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);

    @Value("${spring.datasource.url:jdbc:postgresql://localhost:5432/nexoffer}")
    private String pgUrl;

    @Value("${spring.datasource.username:postgres}")
    private String pgUser;

    @Value("${spring.datasource.password:postgres}")
    private String pgPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        // First try PostgreSQL
        try {
            log.info("🔌 Attempting connection to PostgreSQL at {}", pgUrl);
            try (Connection conn = DriverManager.getConnection(pgUrl, pgUser, pgPassword)) {
                log.info("✅ Connected successfully to PostgreSQL database: {}", conn.getCatalog());
            }

            return DataSourceBuilder.create()
                    .driverClassName("org.postgresql.Driver")
                    .url(pgUrl)
                    .username(pgUser)
                    .password(pgPassword)
                    .build();
        } catch (Exception ex) {
            log.warn("⚠️ PostgreSQL connection failed ({}). Switching seamlessly to resilient in-memory H2 database.", ex.getMessage());
        }

        // Resilient fallback to in-memory H2 database
        return DataSourceBuilder.create()
                .driverClassName("org.h2.Driver")
                .url("jdbc:h2:mem:nexoffer;DB_CLOSE_DELAY=-1;MODE=PostgreSQL")
                .username("sa")
                .password("")
                .build();
    }
}
