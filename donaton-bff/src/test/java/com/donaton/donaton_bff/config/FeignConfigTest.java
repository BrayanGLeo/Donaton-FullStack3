package com.donaton.donaton_bff.config;

import feign.RequestTemplate;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import static org.junit.jupiter.api.Assertions.assertTrue;

class FeignConfigTest {

    @Test
    void testRequestInterceptor() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token123");
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));

        FeignConfig config = new FeignConfig();
        RequestTemplate template = new RequestTemplate();
        config.requestInterceptor().apply(template);

        assertTrue(template.headers().containsKey("Authorization"));
        assertTrue(template.headers().get("Authorization").contains("Bearer token123"));
        
        RequestContextHolder.resetRequestAttributes();
    }

    @Test
    void testRequestInterceptor_NullAttributes() {
        RequestContextHolder.resetRequestAttributes();
        FeignConfig config = new FeignConfig();
        RequestTemplate template = new RequestTemplate();
        config.requestInterceptor().apply(template);
        assertTrue(!template.headers().containsKey("Authorization"));
    }

    @Test
    void testRequestInterceptor_NoAuthHeader() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
        
        FeignConfig config = new FeignConfig();
        RequestTemplate template = new RequestTemplate();
        config.requestInterceptor().apply(template);
        assertTrue(!template.headers().containsKey("Authorization"));
        
        RequestContextHolder.resetRequestAttributes();
    }
}
