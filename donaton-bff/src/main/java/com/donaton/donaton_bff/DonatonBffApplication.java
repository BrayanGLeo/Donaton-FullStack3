package com.donaton.donaton_bff;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients 
public class DonatonBffApplication {

    public static void main(String[] args) {
        SpringApplication.run(DonatonBffApplication.class, args);
    }

}