package com.agent_Spring.agent_spring.ChungbukNews;


import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/chungbuk_news")
@CrossOrigin(origins = "http://localhost:3000")
public class ChungbukNewsController {

    private final ChungbukNewsService newsService;

    public ChungbukNewsController(ChungbukNewsService newsService){
        this.newsService = newsService;
    }

    @GetMapping
    public List<ChungbukNewsDto> getNews(){
        return newsService.getAllNews();
    }
}
