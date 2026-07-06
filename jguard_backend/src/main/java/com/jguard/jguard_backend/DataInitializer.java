package com.jguard.jguard_backend;

import com.jguard.jguard_backend.chungbuknews.ChungbukNews;
import com.jguard.jguard_backend.chungbuknews.ChungbukNewsRepository;
import com.jguard.jguard_backend.fraudcase.FraudCase;
import com.jguard.jguard_backend.fraudcase.FraudCaseRepository;
import com.jguard.jguard_backend.fraudcase.FraudRegionStat;
import com.jguard.jguard_backend.fraudcase.FraudRegionStatRepository;
import com.jguard.jguard_backend.risk.RegionMarketStat;
import com.jguard.jguard_backend.risk.RegionMarketStatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 앱 기동 시 테이블이 비어 있으면 초기 데이터를 시드한다.
 * 시도별 피해 통계는 국토교통부 전세사기피해자 결정 현황(2025-12 기준) 비율을 따른 표본값.
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final String BASIS_DATE = "2025-12";

    private final FraudCaseRepository fraudCaseRepository;
    private final FraudRegionStatRepository fraudRegionStatRepository;
    private final ChungbukNewsRepository chungbukNewsRepository;
    private final RegionMarketStatRepository regionMarketStatRepository;

    @Override
    public void run(String... args) {
        if (fraudRegionStatRepository.count() == 0) {
            seedRegionStats();
        }
        if (regionMarketStatRepository.count() == 0) {
            seedMarketStats();
        }
        if (fraudCaseRepository.count() == 0) {
            seedFraudCases();
        }
        if (chungbukNewsRepository.count() == 0) {
            seedChungbukNews();
        }
    }

    private void seedRegionStats() {
        fraudRegionStatRepository.saveAll(List.of(
                stat("서울", 7740, 25.8, 37.5665, 126.9780),
                stat("경기", 6270, 20.9, 37.4138, 127.5183),
                stat("인천", 3510, 11.7, 37.4563, 126.7052),
                stat("부산", 3270, 10.9, 35.1796, 129.0756),
                stat("대전", 2490, 8.3, 36.3504, 127.3845),
                stat("경북", 1140, 3.8, 36.4919, 128.8889),
                stat("대구", 1020, 3.4, 35.8714, 128.6014),
                stat("전북", 780, 2.6, 35.7175, 127.1530),
                stat("충남", 750, 2.5, 36.6588, 126.6728),
                stat("광주", 570, 1.9, 35.1595, 126.8526),
                stat("경남", 570, 1.9, 35.4606, 128.2132),
                stat("전남", 450, 1.5, 34.8161, 126.4629),
                stat("충북", 420, 1.4, 36.6357, 127.4917),
                stat("울산", 300, 1.0, 35.5384, 129.3114),
                stat("강원", 300, 1.0, 37.8228, 128.1555),
                stat("제주", 210, 0.7, 33.4996, 126.5312),
                stat("세종", 180, 0.6, 36.4800, 127.2890)
        ));
    }

    private FraudRegionStat stat(String sido, int victimCount, double share, double lat, double lng) {
        return FraudRegionStat.builder()
                .sido(sido)
                .victimCount(victimCount)
                .share(share)
                .lat(lat)
                .lng(lng)
                .basisDate(BASIS_DATE)
                .build();
    }

    /**
     * 시도별 전세 시장 지표.
     * 전세가율은 한국부동산원 임대차시장 사이렌(아파트/연립·다세대 최근 3개월),
     * 사고율은 HUG 전세보증금 반환보증 지역별 사고 통계 비율을 따른 표본값.
     */
    private void seedMarketStats() {
        regionMarketStatRepository.saveAll(List.of(
                market("서울", 63.2, 70.4, 4.1),
                market("경기", 68.5, 80.1, 6.3),
                market("인천", 74.3, 83.6, 8.9),
                market("부산", 72.1, 77.2, 5.6),
                market("대전", 73.4, 78.3, 6.9),
                market("대구", 70.6, 76.1, 4.8),
                market("광주", 71.2, 74.0, 3.9),
                market("울산", 73.8, 72.5, 3.4),
                market("세종", 55.7, 60.2, 1.8),
                market("강원", 77.9, 72.3, 2.7),
                market("충북", 79.1, 75.6, 3.6),
                market("충남", 78.2, 76.4, 4.2),
                market("전북", 80.3, 74.1, 3.1),
                market("전남", 76.0, 70.2, 2.4),
                market("경북", 78.8, 73.4, 2.9),
                market("경남", 76.4, 72.8, 3.3),
                market("제주", 61.8, 65.3, 1.6)
        ));
    }

    private RegionMarketStat market(String sido, double ratioApt, double ratioVilla, double accidentRate) {
        return RegionMarketStat.builder()
                .sido(sido)
                .jeonseRatioApt(ratioApt)
                .jeonseRatioVilla(ratioVilla)
                .hugAccidentRate(accidentRate)
                .basisDate(BASIS_DATE)
                .build();
    }

    private void seedFraudCases() {
        fraudCaseRepository.saveAll(List.of(
                // 서울
                fraudCase("서울", "강남구", "역삼동", "테헤란로 인근 오피스텔", "2025-03-14", 42, "깡통전세"),
                fraudCase("서울", "강남구", "논현동", "학동로 다세대주택", "2025-05-02", 17, "이중계약"),
                fraudCase("서울", "강남구", "압구정동", "압구정로 빌라", "2024-11-21", 9, "신탁사기"),
                fraudCase("서울", "서초구", "서초동", "서초대로 오피스텔", "2025-01-30", 28, "깡통전세"),
                fraudCase("서울", "서초구", "잠원동", "잠원로 다세대주택", "2025-06-11", 12, "무자본 갭투자"),
                fraudCase("서울", "서초구", "반포동", "신반포로 빌라", "2024-09-05", 7, "불법 중개"),
                // 대전
                fraudCase("대전", "유성구", "궁동", "대학로 원룸촌", "2025-02-18", 96, "무자본 갭투자"),
                fraudCase("대전", "유성구", "봉명동", "봉명로 오피스텔", "2025-04-27", 54, "깡통전세"),
                fraudCase("대전", "유성구", "신성동", "신성로 다가구주택", "2024-12-09", 23, "이중계약"),
                fraudCase("대전", "서구", "둔산동", "둔산로 오피스텔", "2025-05-20", 61, "깡통전세"),
                fraudCase("대전", "서구", "탄방동", "탄방로 다가구주택", "2025-03-03", 33, "신탁사기"),
                fraudCase("대전", "서구", "월평동", "월평로 다세대주택", "2024-10-16", 15, "불법 중개"),
                // 대구
                fraudCase("대구", "수성구", "범어동", "동대구로 오피스텔", "2025-01-22", 26, "깡통전세"),
                fraudCase("대구", "수성구", "만촌동", "달구벌대로 빌라", "2024-08-30", 11, "이중계약"),
                fraudCase("대구", "수성구", "황금동", "황금로 다세대주택", "2025-06-02", 8, "불법 중개"),
                fraudCase("대구", "달서구", "상인동", "월배로 원룸", "2025-02-11", 19, "무자본 갭투자"),
                fraudCase("대구", "달서구", "진천동", "진천로 다가구주택", "2024-11-07", 13, "깡통전세"),
                fraudCase("대구", "달서구", "월성동", "조암로 빌라", "2025-04-15", 10, "신탁사기"),
                // 부산
                fraudCase("부산", "해운대구", "우동", "센텀중앙로 오피스텔", "2025-03-28", 73, "깡통전세"),
                fraudCase("부산", "해운대구", "좌동", "해운대로 다세대주택", "2025-05-09", 31, "이중계약"),
                fraudCase("부산", "해운대구", "송정동", "송정중앙로 빌라", "2024-12-19", 14, "불법 중개"),
                fraudCase("부산", "남구", "대연동", "수영로 원룸촌", "2025-01-08", 48, "무자본 갭투자"),
                fraudCase("부산", "남구", "용호동", "용호로 다가구주택", "2025-06-24", 22, "깡통전세"),
                fraudCase("부산", "남구", "문현동", "문현금융로 오피스텔", "2024-09-17", 16, "신탁사기"),
                // 충청북도
                fraudCase("충청북도", "청주시", "청주", "복대동 오피스텔", "2025-04-04", 57, "깡통전세"),
                fraudCase("충청북도", "청주시", "청주", "가경동 다세대주택", "2025-02-25", 34, "무자본 갭투자"),
                fraudCase("충청북도", "충주시", "충주", "연수동 원룸", "2025-05-30", 18, "이중계약"),
                fraudCase("충청북도", "충주시", "충주", "칠금동 다가구주택", "2024-10-28", 9, "깡통전세"),
                fraudCase("충청북도", "제천시", "제천", "하소동 빌라", "2025-01-16", 12, "불법 중개"),
                fraudCase("충청북도", "보은군", "보은", "보은읍 다세대주택", "2024-11-13", 4, "이중계약"),
                fraudCase("충청북도", "옥천군", "옥천", "옥천읍 원룸", "2025-03-21", 6, "깡통전세"),
                fraudCase("충청북도", "영동군", "영동", "영동읍 다가구주택", "2024-12-02", 3, "불법 중개"),
                fraudCase("충청북도", "증평군", "증평", "증평읍 빌라", "2025-04-19", 5, "무자본 갭투자"),
                fraudCase("충청북도", "진천군", "진천", "덕산읍 오피스텔", "2025-06-06", 11, "깡통전세"),
                fraudCase("충청북도", "괴산군", "괴산", "괴산읍 다세대주택", "2024-08-22", 2, "이중계약"),
                fraudCase("충청북도", "음성군", "음성", "금왕읍 원룸", "2025-02-07", 7, "신탁사기")
        ));
    }

    private FraudCase fraudCase(String city, String district, String neighborhood,
                                String address, String date, int victimCount, String fraudType) {
        return FraudCase.builder()
                .city(city)
                .district(district)
                .neighborhood(neighborhood)
                .address(address)
                .date(date)
                .victimCount(victimCount)
                .fraudType(fraudType)
                .build();
    }

    private void seedChungbukNews() {
        chungbukNewsRepository.saveAll(List.of(
                news("충북 청주 전세사기 피해 잇따라…오피스텔 밀집지역 주의보",
                        "전세사기 청주", "충북일보", LocalDateTime.of(2025, 6, 18, 9, 30)),
                news("충주서 무자본 갭투자 임대인 구속…피해자 30여 명",
                        "전세사기 충주", "중부매일", LocalDateTime.of(2025, 5, 27, 14, 0)),
                news("충북도, 전세피해지원센터 상담 건수 1년 새 2배 증가",
                        "전세피해지원센터 충북", "충청타임즈", LocalDateTime.of(2025, 4, 9, 11, 15)),
                news("제천 다가구주택 이중계약 사기…보증금 미반환 피해 확산",
                        "전세사기 제천", "충북일보", LocalDateTime.of(2025, 3, 12, 16, 45)),
                news("깡통전세 구별법은? 충북 전세가율 상위 지역 분석",
                        "깡통전세 충북", "중부매일", LocalDateTime.of(2025, 2, 20, 10, 0)),
                news("전세보증금 반환보증 가입 급증…충북 가입률 전국 평균 밑돌아",
                        "전세보증금 반환보증", "충청타임즈", LocalDateTime.of(2025, 1, 8, 13, 30))
        ));
    }

    private ChungbukNews news(String title, String keyword, String source, LocalDateTime publishedAt) {
        ChungbukNews news = new ChungbukNews();
        news.setTitle(title);
        news.setKeyword(keyword);
        news.setSource(source);
        news.setPublishedAt(publishedAt);
        news.setUrl("https://search.naver.com/search.naver?where=news&query="
                + keyword.replace(" ", "+"));
        return news;
    }
}
