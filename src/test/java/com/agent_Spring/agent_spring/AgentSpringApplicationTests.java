package com.agent_Spring.agent_spring;

import com.agent_Spring.agent_spring.ChungbukNews.ChungbukNews;
import com.agent_Spring.agent_spring.ChungbukNews.ChungbukNewsRepository;
import com.agent_Spring.agent_spring.FraudCase.FraudCase;
import com.agent_Spring.agent_spring.FraudCase.FraudCaseRepository;
import com.agent_Spring.agent_spring.answer.Answer;
import com.agent_Spring.agent_spring.answer.AnswerRepository;
import com.agent_Spring.agent_spring.question.QuestionRepository;
import com.agent_Spring.agent_spring.question.QuestionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class AgentSpringApplicationTests {

//	@Autowired
//	private FraudCaseRepository fraudCaseRepository;
//
	@Autowired
	private ChungbukNewsRepository chungbukNewsRepository;

	@Test
	void testJpa() {
		ChungbukNews chungbukNews = new ChungbukNews();
		chungbukNews.setTitle("청주서 전세사기 피해 주장 17명 고소장 제출");
		chungbukNews.setUrl("https://v.daum.net/v/20241113184128803");
		chungbukNewsRepository.save(chungbukNews);

//		FraudCase fraud1 = new FraudCase();
//		fraud1.setCity("서울");
//		fraud1.setDistrict("강남구");
//		fraud1.setNeighborhood("역삼동");
//		fraud1.setAddress("서울 강남구 역삼동 123");
//		fraud1.setFraudType("보증금 미반환");
//		fraud1.setVictimCount(3);
//		fraud1.setDate(String.valueOf(LocalDate.of(2024, 12, 1)));
//		fraud1.setArticleUrl("https://example.com/article1");
//
//		FraudCase fraud2 = new FraudCase();
//		fraud2.setCity("서울");
//		fraud2.setDistrict("강남구");
//		fraud2.setNeighborhood("역삼동");
//		fraud2.setAddress("서울 강남구 역삼동 456");
//		fraud2.setFraudType("이중계약");
//		fraud2.setVictimCount(1);
//		fraud2.setDate(String.valueOf(LocalDate.of(2025, 1, 15)));
//		fraud2.setArticleUrl("https://example.com/article2");

//		fraudCaseRepository.save(fraud1);
//		fraudCaseRepository.save(fraud2);


		// 3. 청주 흥덕구 강서동 도시형 생활주택 6.3억 원대 전세사기 (C씨 사건)
		// 3. 청주 흥덕구 강서동 도시형 생활주택 6.3억 원대 전세사기 (안 모 씨 사건 - KBS 기사)
//		FraudCase cheongjuNewCase = new FraudCase();
//		cheongjuNewCase.setCity("청주시");
//		cheongjuNewCase.setDistrict("청주"); // 봉명동, 신봉동은 흥덕구에 위치
//		cheongjuNewCase.setNeighborhood("청주"); // 여러 동을 포함
//		cheongjuNewCase.setAddress("충북 청주시 흥덕구 봉명동/신봉동 빌라 5곳"); // 특정 번지수 없음
//		cheongjuNewCase.setFraudType("빌라 보증금 미반환 (일가족/공인중개사 연루)");
//		cheongjuNewCase.setVictimCount(17); // 세입자 17명
//		// 기사 발행일(2024.12.09)과 "최근" 내용을 고려하여 추정
//		cheongjuNewCase.setDate(String.valueOf(LocalDate.of(2024, 11, 30)));
//		cheongjuNewCase.setArticleUrl("https://ccn.hcn.co.kr/user/news/BD_newsView.do?news_category=01&soCode=114&socttSeq=0&socttSn=NS2024111400066&story_id=NS2024111400066&story_seq=0&utm_source=chatgpt.com"); // 기사 전문 URL (추정)
//		fraudCaseRepository.save(cheongjuNewCase);


	}
}