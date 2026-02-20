package com.puspo.uptime;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class UptimeApplication {

	public static void main(String[] args) {
		SpringApplication.run(UptimeApplication.class, args);
	}

}
