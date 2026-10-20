package com.app.start_app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.multipart.support.StandardServletMultipartResolver;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class StartAppApplication {

	public static void main(String[] args) {
		SpringApplication.run(StartAppApplication.class, args);
	}

	@Bean
	StandardServletMultipartResolver multipartResolver() {
		return new StandardServletMultipartResolver();
	}

}
