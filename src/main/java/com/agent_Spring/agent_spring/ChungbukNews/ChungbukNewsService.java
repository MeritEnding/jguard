package com.agent_Spring.agent_spring.ChungbukNews;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChungbukNewsService {

    private final ChungbukNewsRepository newsRepository;

    public ChungbukNewsService(ChungbukNewsRepository newsRepository) {
        this.newsRepository = newsRepository;
    }

    public List<ChungbukNewsDto> getAllNews() {
        return newsRepository.findAll()
                .stream()
                .map(news -> new ChungbukNewsDto(
                        news.getTitle(),
                        news.getUrl(),
                        news.getSource(), // 추가
                        news.getPublishedAt(), // 추가
                        news.getKeyword() // 추가
                ))
                .collect(Collectors.toList());
    }
}