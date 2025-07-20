package com.example.weatherapi;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class WeatherController {

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/weather")
    public Map<String, Object> getWeatherByCoordinates(@RequestParam double lat, @RequestParam double lon) {
        String url = String.format(
                "https://api.open-meteo.com/v1/forecast?latitude=%s&longitude=%s&current_weather=true&hourly=temperature_2m,weathercode&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto",
                lat, lon
        );
        return restTemplate.getForObject(url, Map.class);
    }
}
